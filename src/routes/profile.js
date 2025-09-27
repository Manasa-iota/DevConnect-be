import { Router } from "express";
import validator from "validator";

import { isAuth } from "../middlewares/auth.js";
import { validateProfileUpdate } from "../utils/validations.js"
import { User } from "../models/user.model.js";
const router = Router();

router.get("/view",isAuth, async(req,res)=>{
    try{
        res.send(req.user);
    }
    catch(err){
        res.status(400).json({error:err.messsage})
    }
})

router.patch("/edit", isAuth, async (req, res) => {
    try {
        validateProfileUpdate(req);
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            req.body,
            { runValidators: true, new: true }
        );

        res.status(200).json({
            success: true,
            user: updatedUser
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/password',isAuth, async (req, res) =>{
    
    try{
        const {oldPassword,newPassword} = req.body;

        if(!oldPassword || !newPassword){
            throw new Error("empty password");
        }
        const isMatch = await req.user.comparePassword(oldPassword);

        if(!isMatch){
            throw new Error('Wrong password');
        }

        if(!validator.isStrongPassword(newPassword)){
            throw new Error("weak password");
        }

        req.user.password = newPassword;
        await req.user.save();

        res.send("password updated sucessfully");
    }
    catch(err){
        res.status(400).json({error:err.message});
    }

})



export default router;