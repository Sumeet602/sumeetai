import axios from "axios"
import fs from "fs"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import redis from "../../../shared/redis/redis.js"


export const agent=async (req,res,next) => {
    try {
        const {prompt,conversationId,agent}=req.body
        const file=req.file
        console.log("file",file)
        const userId=req.headers["x-user-id"]

        // If the user attached an image, keep a copy in S3 so it shows in the
        // conversation as a clickable thumbnail now and after a reload.
        let userImages=[]
        if(file && file.mimetype?.startsWith("image/")){
            try{
                const buffer=fs.readFileSync(file.path)
                const key=`chat-${Date.now()}-${(file.originalname||"image").replace(/[^\w.-]/g,"_")}`
                await uploadToS3(key,buffer,file.mimetype)
                userImages=[await getFromS3(key,7*24*60*60)]
            }catch(err){
                console.log("user image upload failed",err)
            }
        }

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"user",content:prompt,images:userImages
        })
        const result=await graph.invoke({
            prompt,conversationId,agent,userId,file
        })
        console.log("result",result)
       await addMessage(conversationId,"user",prompt)
        await addMessage(conversationId,"assistant",result.aiResponse)
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"assistant",content:result?.aiResponse,images:result?.images,artifacts:result?.artifacts
        })
        return res.status(200).json({
            answer:result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts,
            userImages
        })

    } catch (error) {
       next(error)
    }
}
