import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema =new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
    },
    password:{
        type : String,
        required:true
    },
    age:{
        type:Number 
    },
    gender:{
        type:String,
        enum:["male","female","others"]
    },
    photoUrl:{
        type: String,
        default:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Favatar_8184173&psig=AOvVaw1cQ6myXBWT4wFAdeU-SVdA&ust=1758429591803000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLCm1vbC5o8DFQAAAAAdAAAAABAK"
    },
    about:{
        type: String
    },
    skills:{
        type:[String]
    }
},{timestamps: true})

userSchema.methods.getJWT = function(){
    const token = jwt.sign({_id:this._id},process.env.JWT_SECRET,{expiresIn:"7d"});
    return token;
}

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.comparePassword = async function(inputPassword){
    return await bcrypt.compare(inputPassword,this.password);
}

export const User = mongoose.model("User",userSchema)