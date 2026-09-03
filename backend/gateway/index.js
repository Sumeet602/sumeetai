import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware"

const port = process.env.PORT

const app = express()
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            "http://sumeetai-frontend-030388905866-ap-south-1.s3-website.ap-south-1.amazonaws.com",
            "http://localhost:5173"
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to true to avoid breaking during frontend domain changes
        }
    },
    credentials: true
}))
app.use(morgan("dev"))
app.use(cookieParser())

// Auth - no body parsing, pure proxy
app.use("/api/auth", createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    on: {
        error: (err, req, res) => {
            console.error("Auth proxy error:", err)
            res.status(502).json({ message: "Auth service unavailable" })
        }
    }
}))

// Chat - requires auth, forwards user id
app.use("/api/chat", protect, createProxyMiddleware({
    target: process.env.CHAT_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/chat": "" },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.user) {
                proxyReq.setHeader("x-user-id", req.user.userId)
            }
        },
        error: (err, req, res) => {
            console.error("Chat proxy error:", err)
            res.status(502).json({ message: "Chat service unavailable" })
        }
    }
}))

// Agent - requires auth, forwards user id
app.use("/api/agent", protect, createProxyMiddleware({
    target: process.env.AGENT_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/agent": "" },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.user) {
                proxyReq.setHeader("x-user-id", req.user.userId)
            }
        },
        error: (err, req, res) => {
            console.error("Agent proxy error:", err)
            res.status(502).json({ message: "Agent service unavailable" })
        }
    }
}))

// Billing - requires auth, forwards user id
app.use("/api/billing", protect, createProxyMiddleware({
    target: process.env.BILLING_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/billing": "" },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.user) {
                proxyReq.setHeader("x-user-id", req.user.userId)
            }
        },
        error: (err, req, res) => {
            console.error("Billing proxy error:", err)
            res.status(502).json({ message: "Billing service unavailable" })
        }
    }
}))

app.get("/api/me", protect, getCurrentUser)
app.get("/", (req, res) => {
    res.json({ message: "hello from gateway v6" })
})

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Gateway Error:", err)
    return res.status(err.status || 500).json({ message: err.message })
})

app.listen(port, () => {
    console.log(`gateway started at ${port}`)
})
