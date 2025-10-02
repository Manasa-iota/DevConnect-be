import { Router } from "express";
import validator from "validator";

import { isAuth } from "../middlewares/auth.js";
import { validateProfileUpdate } from "../utils/validations.js";
import { User } from "../models/user.model.js";

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


const getProfileHandler = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: mapUser(req.user) });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
router.get("/", isAuth, getProfileHandler);
router.get("/view", isAuth, getProfileHandler);


const patchProfileHandler = async (req, res) => {
  try {
    validateProfileUpdate(req);
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, {
      runValidators: true,
      new: true,
    });
    return res.status(200).json({ success: true, user: mapUser(updated) });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
router.patch("/", isAuth, patchProfileHandler);
router.patch("/edit", isAuth, patchProfileHandler);


router.patch("/password", isAuth, async (req, res) => {
  try {
    const currentPassword = req.body.currentPassword ?? req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing password fields" });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ success: false, message: "Weak password" });
    }

    req.user.password = newPassword;
    await req.user.save();

    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;