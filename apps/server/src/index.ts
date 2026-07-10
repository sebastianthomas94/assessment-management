import cors from "cors";
import express, { type Request, type Response } from "express";
import morgan from "morgan";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the Assessment Management API!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
