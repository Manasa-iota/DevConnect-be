import {Router} from "express"

import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { isAuth } from "../middlewares/auth.js";

const router = Router();

const USER_SAFE_DATA = "firstName lastName age gender photoUrl about skills"

router.get("/requests", isAuth, async(req,res)=>{
    try{
        const connectionsRequests = await ConnectionRequest.find({to:req.user._id,status:"interested"}).populate("from", USER_SAFE_DATA);

        res.json({
            message:"requests fetched successfully",
            data : connectionsRequests
        })

    }
    catch(err){
        res.status(400).json({error:err.message})
    }
})


router.get("/connections", isAuth, async(req,res)=>{
    try{
        const connectionsRequests = await ConnectionRequest.find({
            $or:[
                {to:req.user._id,status:"accepted"},
                {from:req.user._id,status:"accepted"}
            ]
        }).populate('from to',USER_SAFE_DATA)

        const data = connectionsRequests.map(request=>{
           if (request.from._id.equals(req.user._id)) {
                return request.to;
            } else {
                return request.from; 
            }
        })
        res.json({
            message:"connections fetched successfully",
            data : data
        })

    }
    catch(err){
        res.status(400).json({error:err.message})
    }
})


export default router;