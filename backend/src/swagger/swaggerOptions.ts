const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TemuDataku API Docs",
      version: "1.0.0",
      description: "Dokumentasi API Temudataku",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Development server",
      },
      {
        url: "https://api.temudataku.com",
        description: "Production server",
      },
      {
        url: "https://staging.temudataku.com",
        description: "Staging server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export default options;
