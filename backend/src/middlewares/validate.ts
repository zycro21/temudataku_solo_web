import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodObject, ZodEffects, ZodType } from "zod";

const parseFormFields = (body: Record<string, any>) => {
  const parsed: Record<string, any> = {};

  for (const key in body) {
    let value = body[key];

    const skipParseFields = [
      "role",
      "phoneNumber",
      "email",
      "fullName",
      "city",
      "province",
    ];

    if (skipParseFields.includes(key)) {
      parsed[key] = value;
      continue;
    }

    if (typeof value === "string") {
      if (value === "true" || value === "false") {
        parsed[key] = value === "true";
      } else if (!isNaN(Number(value))) {
        parsed[key] = Number(value);
      } else {
        try {
          parsed[key] = JSON.parse(value);
        } catch {
          parsed[key] = value;
        }
      }
    } else {
      parsed[key] = value;
    }
  }

  return parsed;
};

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers["content-type"];
    const isFormData = contentType?.includes("multipart/form-data");
    const rawData = isFormData ? parseFormFields(req.body) : req.body;

    console.log("Content-Type:", contentType);
    console.log("Raw Data:", rawData);
    console.log("Query:", req.query);

    // Handle ZodObject or ZodEffects
    let shape = {};
    if (schema instanceof ZodObject) {
      shape = (schema as ZodObject<any>).shape;
      console.log("Schema is ZodObject");
    } else if (schema instanceof ZodEffects) {
      console.log("Schema is ZodEffects");
      let currentSchema: ZodSchema<any> = schema; // Anotasi tipe eksplisit
      while (currentSchema instanceof ZodEffects) {
        currentSchema = (currentSchema as ZodEffects<ZodType>)._def
          .schema as ZodSchema<any>;
      }
      if (currentSchema instanceof ZodObject) {
        shape = (currentSchema as ZodObject<any>).shape;
        console.log("Found ZodObject inside ZodEffects");
      } else {
        console.log("ZodEffects does not resolve to ZodObject");
      }
    } else {
      console.log("Schema is neither ZodObject nor ZodEffects:", schema);
    }

    const hasParams = "params" in shape;
    const hasQuery = "query" in shape;
    const hasBody = "body" in shape;

    console.log("Schema Shape:", { hasBody, hasParams, hasQuery });

    const payload: any = {};
    if (hasBody) payload.body = rawData;
    if (hasParams) payload.params = req.params;
    if (hasQuery) payload.query = req.query;

    console.log("Payload to validate:", payload);

    const result = schema.safeParse(
      hasBody || hasParams || hasQuery ? payload : rawData
    );

    if (!result.success) {
      console.log("Validation Errors:", result.error.errors);
      res.status(400).json({
        message: "Validation error",
        errors: result.error.errors.map((e) => e.message),
      });
      return;
    }

    console.log("Validated Data:", result.data);

    if (hasBody) {
      req.body = result.data.body;
      (req as any).validatedBody = result.data.body;
    }
    if (hasParams) {
      (req as any).validatedParams = result.data.params;
    }
    if (hasQuery) {
      (req as any).validatedQuery = result.data.query;
    }
    if (!hasBody && !hasParams && !hasQuery) {
      req.body = result.data;
      (req as any).validatedBody = result.data;
    }

    next();
  };
