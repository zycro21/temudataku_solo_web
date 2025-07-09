declare module "swagger-jsdoc" {
  import { OpenAPIObject } from "openapi3-ts";

  interface Options {
    definition: OpenAPIObject;
    apis: string[];
  }

  function swaggerJSDoc(options: Options): OpenAPIObject;
  export default swaggerJSDoc;
}
