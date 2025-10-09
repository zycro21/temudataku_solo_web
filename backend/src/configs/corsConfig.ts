import { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "https://temudataku.com",
  "http://localhost:5001",
  "http://31.97.110.218:3000",
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
