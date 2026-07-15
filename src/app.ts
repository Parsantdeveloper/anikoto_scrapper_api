import dotenv from "dotenv"

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error_middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request_logger_middleware.js";
import animeRoutes from "./routes/anime.js";

export const app = express();

dotenv.config();
app.use("/api/anime", animeRoutes);

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(helmet());
app.use(express.json());
app.use(requestLoggerMiddleware); // attaches req.log with requestId to every request



app.use(errorHandler);
export default app;