import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import authRouter from "./routes/auth.js";
import assessmentsRouter from "./routes/assessments.js";
import publicRouter from "./routes/public.js";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// CORS — allow the Vite dev client to send cookies.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the Assessment Management API!" });
});

app.use("/api/auth", authRouter);
app.use("/api/assessments", assessmentsRouter);
app.use("/api/public", publicRouter);

// Connect to MongoDB, then start the HTTP server.
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/assessment-management";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("📦 MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
