import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDb } from "./db/dbConnection.js";
import authRoutes from "./routes/auth.routes.js";
import { initSocket } from "./socket/socket.io.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Init socket
initSocket(server);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});