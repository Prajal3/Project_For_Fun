import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

import cookieparser from "cookie-parser";

import { connectDb } from "./db/dbConnection.js";

//routes import 
import authRouters from "./routes/auth.routes.js"; 







dotenv.config({quiet: true});



const port = process.env.PORT || 5000;
const app = express();










// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or curl)
    if (!origin) return callback(null, true);
    // Check if the request origin is in the allowedOrigins list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieparser());



// Routes
app.use("/api/auth", authRouters);;










app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDb();
});
