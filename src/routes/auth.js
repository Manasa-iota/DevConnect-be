import { Router } from "express";
import { User } from "../models/user.model.js";
import { validateSignupData } from "../utils/validations.js";
import { isAuth } from "../middlewares/auth.js";

const router = Router();

const mapUser = (u) => ({
  id: u._id.toString(),
  name: [u.firstName, u.lastName].filter(Boolean).join(" "),
  email: u.email,
  title: u.about ?? null,
  avatar: u.photoUrl ?? null,
  bio: u.about ?? null,
  age: u.age ?? null,
  gender: u.gender ?? null,
  skills: u.skills ?? [],
});

router.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ firstName, lastName, email, password });
    return res.status(201).json({ success: true, user: mapUser(user) });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Account does not exist" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });

    return res.status(200).json({ success: true, user: mapUser(user) });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});


router.post("/logout", async (_req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});


router.get("/me", isAuth, async (req, res) => {
  
  return res.status(200).json({ success: true, user: mapUser(req.user) });
});

export default router;