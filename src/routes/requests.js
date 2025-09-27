import Router, { json } from "express";

import { isAuth } from "../middlewares/auth.js"
import { User } from "../models/user.model.js";
import { ConnectionRequest } from "../models/connectionRequest.model.js";

const router = Router();

router.post("/send/:status/:toUserId", isAuth, async(req, res)=>{
    try{
        const fromUserId = req.user._id;
        const toUserId   = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored","interested"];

        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                error:"Invalid status type"
            })
        }

        if(fromUserId==toUserId){
            return res.status(400).json({error:"cannot send connection request to self"})
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {from:fromUserId,to:toUserId},
                {from:toUserId,to:fromUserId}
            ]
        }) 
        if (existingConnectionRequest){
           return res.status(400).json({error:"connection already exist"})
        }

        const connectionRequest = new ConnectionRequest({from:fromUserId,to:toUserId,status:status})
        await connectionRequest.save();

        res.json({message:status+" successfully"});
    }
    catch(err){
        res.status(400).json({error:err.message})
    }

})

router.get("/review", isAuth, async(req,res)=>{

    

})

export default router;