import { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend-domain.com",
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
