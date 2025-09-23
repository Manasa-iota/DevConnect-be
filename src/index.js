import express from "express";

import { User } from "./models/user.model.js";
import { connectDB } from "./config/database.js";
const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("hello")
})

app.post("/signup", async(req,res)=>{
    const userObj =req.body;
    console.log(userObj);
    const user = await User.insertOne(userObj);
    res.send("signup sucessful");
})

app.get("/feed",(req,res)=>{
    User.find();
})

connectDB().then(()=>{
    app.listen(3000,()=>{
        console.log("listening on port 3000");
    })
}).catch((err)=>{
    console.log(err)
})