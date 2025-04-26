import uploadRoutes from "./routes/upload";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import connectDB from "./db";
import path from "path";

dotenv.config();

connectDB();

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://reddit-clone2-frontend.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
  }));

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://reddit-clone2-frontend.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Reddit Clone API");
});

export default app;