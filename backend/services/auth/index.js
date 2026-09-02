import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import router from "./routes/auth.route.js"
dotenv.config()

const port =process.env.PORT

const app=express()
app.use(express.json())
app.use("/",router)
app.get("/",(req,res)=>{
    res.json({message:"hello from auth"})
})

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Auth Error:", err);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Bad JSON payload", error: err.message });
    }
    return res.status(err.status || 500).json({ message: err.message });
});

app.listen(port,()=>{
    console.log(`auth started at ${port}`)
    connectDb()
})
