import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
const isAuth= (req,res,next)=>{
    const {token} = req.cookies;
    if(!token){ 
        throw new Error("Invalid token");
    }
    const {data} = jwt.verify(token,process.env.JWT_SECRET)
    if(!data){
        throw new Error("Invlaid token");
    }
    const user = User.findOneById(data._id);
    req.user = user;
    next();
}