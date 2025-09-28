import {Router} from 'express';

import {User} from "../models/user.model.js"
import {validateSignupData} from "../utils/validations.js"
import { isAuth } from '../middlewares/auth.js';

const router = Router();

router.post("/signin", async (req, res) => {
    try {
        validateSignupData(req);

        const { firstName, lastName, email, password } = req.body;

        const isExist = await User.findOne({ email });
        if (isExist) {
            throw new Error("User already exists");
        }

        await User.create({ firstName, lastName, email, password });

        res.send("User created successfully");
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error("Invalid credentials");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Account does not exist");
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        const token = user.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.send("Login successful");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/logout",async(req,res)=>{
    try{
        res.cookie("token", "", {
            httpOnly: true,
            maxAge: 0
        });
        res.send("logout successful");
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
})

export default router;