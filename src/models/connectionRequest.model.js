import mongoose from "mongoose";

import { User } from "./user.model.js";


const connectionRequestSchema = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    status:{
        type: String,
        enum: ["accepted","ignored","interested","rejected"],
        required: true
    }

},{timestamps:true})

connectionRequestSchema.index({from: 1, to: 1});

export const  ConnectionRequest = mongoose.model("ConnectionRequest",connectionRequestSchema);