import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"
const port =process.env.PORT

const app=express()
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use(morgan("dev"))
app.use(cookieParser())
app.use("/api/auth",proxy(process.env.AUTH_SERVICE, { parseReqBody: false }))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE, { parseReqBody: false }))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE, { parseReqBody: false }))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE, { parseReqBody: false }))
app.get("/api/me",protect,getCurrentUser)
app.get("/",(req,res)=>{
    res.json({message:"hello from gateway v5"})
})

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Gateway Error:", err);
    return res.status(err.status || 500).json({ message: err.message });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Gateway Error:", err);
    return res.status(err.status || 500).json({ message: err.message });
});

app.listen(port,()=>{
    console.log(`gateway started at ${port}`)
})
