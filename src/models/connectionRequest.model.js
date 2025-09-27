import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    status:{
        type: String,
        enum: ["accepted","ignored","interested","rejected"],
        required: true
    }

},{timestamps:true})

export const  ConnectionRequest = mongoose.model("ConnectionRequest",connectionRequestSchema)
