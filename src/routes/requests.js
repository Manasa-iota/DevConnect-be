import { Router } from "express";
import mongoose from "mongoose";
import { isAuth } from "../middlewares/auth.js";
import { User } from "../models/user.model.js";
import { ConnectionRequest } from "../models/connectionRequest.model.js";

const router = Router();

const toName = (u) => [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
const mapUser = (u) => ({
  id: u._id.toString(),
  name: toName(u),
  title: u.about ?? null,
  avatar: u.photoUrl ?? null,
});

router.post("/send/:status/:toUserId", isAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { status, toUserId } = req.params;

    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot send request to self" });
    }

    const toUser = await User.findById(toUserId).select("firstName lastName photoUrl about");
    if (!toUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (status === "ignored") {
      return res.status(200).json({ success: true });
    }
    if (status !== "interested") {
      return res.status(400).json({ success: false, message: "Invalid status type" });
    }

    const existing = await ConnectionRequest.findOne({
      $or: [
        { from: fromUserId, to: toUserId },
        { from: toUserId, to: fromUserId },
      ],
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Connection already exists or pending" });
    }

    const doc = await ConnectionRequest.create({ from: fromUserId, to: toUserId, status: "pending" });

    return res.status(201).json({
      success: true,
      request: {
        id: doc._id.toString(),
        toUser: mapUser(toUser),
        status: "pending",
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/review/:status/:requestId", isAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid request id" });
    }
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status type" });
    }

    const reqDoc = await ConnectionRequest.findOne({
      _id: requestId,
      to: req.user._id,
      status: "pending",
    }).populate("from", "firstName lastName photoUrl about");

    if (!reqDoc) {
      return res.status(400).json({ success: false, message: "Invalid request review" });
    }

    reqDoc.status = status;
    await reqDoc.save();

    if (status === "accepted") {
      return res.status(200).json({
        success: true,
        connection: {
          id: reqDoc._id.toString(),
          peer: {
            id: reqDoc.from._id.toString(),
            name: toName(reqDoc.from),
            title: reqDoc.from.about ?? null,
            avatar: reqDoc.from.photoUrl ?? null,
          },
          createdAt: reqDoc.updatedAt,
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/:id/cancel", isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid request id" });
    }
    const reqDoc = await ConnectionRequest.findOne({ _id: id, from: req.user._id, status: "pending" });
    if (!reqDoc) {
      return res.status(404).json({ success: false, message: "Pending outgoing request not found" });
    }
    await ConnectionRequest.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
