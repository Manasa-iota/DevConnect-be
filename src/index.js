import express from "express";
import cookieParser from "cookie-parser";

import { User } from "./models/user.model.js";
import { connectDB } from "./config/database.js";

import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestsRouter from "./routes/requests.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("hello")
})

app.use("/auth",authRouter);

app.use("/profile",profileRouter);

app.use("/requests",requestsRouter);


connectDB().then(()=>{
    app.listen(3000,()=>{
        console.log("listening on port 3000");
    })
}).catch((err)=>{
    console.log(err)
})