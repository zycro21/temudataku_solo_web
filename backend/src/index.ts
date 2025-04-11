import express, { Request, Response } from "express";

const app = express();
const PORT = 5001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
