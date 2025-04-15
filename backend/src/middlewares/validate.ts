import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodObject } from "zod";

/**
 * Auto-parse string fields (from form-data) into appropriate types if possible.
 */
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

// Helper fallback untuk schema biasa (misal, bukan object { body, params })
function payloadBodyAware(schema: ZodSchema, body: any, req: Request) {
  if (
    schema instanceof ZodObject &&
    Object.prototype.hasOwnProperty.call(schema.shape, "body")
  ) {
    return {
      body,
      params: req.params,
      query: req.query,
    };
  }
  return body;
}

/**
 * Middleware validator yang bisa handle JSON & form-data (setelah multer),
 * dan juga bisa validasi params & query jika schema menyertakannya.
 */
export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers["content-type"];
    const isFormData = contentType?.includes("multipart/form-data");
    const rawData = isFormData ? parseFormFields(req.body) : req.body;

    const isZodObject = schema instanceof ZodObject;
    const shape = isZodObject ? (schema as ZodObject<any>).shape : {};

    const hasParams = "params" in shape;
    const hasQuery = "query" in shape;
    const hasBody = "body" in shape;

    const payload: any = {};
    if (hasBody) payload.body = rawData;
    if (hasParams) payload.params = req.params;
    if (hasQuery) payload.query = req.query;

    const result = schema.safeParse(
      hasBody || hasParams || hasQuery ? payload : rawData
    );

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: result.error.errors.map((e) => e.message),
      });
      return;
    }

    // Overwrite hanya jika ada di schema
    if (hasBody) req.body = result.data.body;
    if (hasParams) {
      (req as any).validatedParams = result.data.params;
    }
    if (hasQuery) {
      // karena req.query adalah getter-only (read-only), tidak bisa di-assign langsung
      // jadi kita salin ke req object lain, misal: req.validatedQuery
      (req as any).validatedQuery = result.data.query;
    } else {
      req.body = result.data; // fallback untuk schema biasa
    }

    next();
  };
