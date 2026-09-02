import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import httpProxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import { verifySession } from "./middlewares/auth.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Hello from Gateway" });
});

// Session check route
app.get("/me", verifySession, (req, res) => {
  res.json(req.user);
});

const AUTH_SERVICE = process.env.AUTH_SERVICE || "http://localhost:8001";

// Proxy routes
app.use("/auth", proxyWithHeader(AUTH_SERVICE));
app.use("/chat", verifySession, proxyWithHeader(process.env.CHAT_SERVICE || "http://localhost:8002"));
app.use("/agent", verifySession, proxyWithHeader(process.env.AGENT_SERVICE || "http://localhost:8003"));
app.use("/billing", verifySession, proxyWithHeader(process.env.BILLING_SERVICE || "http://localhost:8004"));

app.listen(PORT, () => {
  console.log(`Gateway started at ${PORT}`);
});