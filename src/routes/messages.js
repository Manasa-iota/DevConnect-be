import { Router } from "express";
import mongoose from "mongoose";
import { isAuth } from "../middlewares/auth.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

const router = Router();
const O = (id) => new mongoose.Types.ObjectId(id);
const pair = (a, b) => {
  const A = O(a), B = O(b);
  const [x, y] = A.toString() < B.toString() ? [A, B] : [B, A];
  return { x, y, key: `${x.toString()}:${y.toString()}` };
};

const userOut = (u) => ({ id: u._id.toString(), name: [u.firstName, u.lastName].filter(Boolean).join(" "), avatar: u.photoUrl || null });
const convOut = (c, me) => {
  const meKey = me.toString();
  const u = c.unread || {};
  const unread = typeof u.get === "function" ? Number(u.get(meKey) || 0) : Number(u[meKey] || 0);
  return {
    id: c._id.toString(),
    participants: c.participants.map((p) => userOut(p)),
    lastMessage: c.lastMessage || "",
    lastSender: c.lastSender ? c.lastSender.toString() : null,
    unread,
    updatedAt: c.updatedAt
  };
};
const msgOut = (m) => ({
  id: m._id.toString(),
  conversationId: m.conversationId.toString(),
  from: m.from.toString(),
  to: m.to.toString(),
  text: m.text,
  readAt: m.readAt,
  createdAt: m.createdAt
});

router.get("/conversations", isAuth, async (req, res) => {
  const me = req.user._id;
  const convs = await Conversation.find({ participants: me }).sort({ updatedAt: -1 }).lean();
  const ids = [...new Set(convs.flatMap((c) => c.participants.map((id) => id.toString())))];
  const users = await User.find({ _id: { $in: ids } }).select("firstName lastName photoUrl").lean();
  const uMap = new Map(users.map((u) => [u._id.toString(), u]));
  const populated = convs.map((c) => ({ ...c, participants: c.participants.map((id) => uMap.get(id.toString())) }));
  res.json({ success: true, items: populated.map((c) => convOut(c, me)) });
});

router.post("/conversations", isAuth, async (req, res) => {
  const me = req.user._id;
  const { peerId } = req.body || {};
  if (!mongoose.isValidObjectId(peerId) || peerId.toString() === me.toString()) return res.status(400).json({ success: false, message: "Invalid peer" });
  const exists = await User.exists({ _id: peerId });
  if (!exists) return res.status(404).json({ success: false, message: "User not found" });

  const { x, y, key } = pair(me, peerId);
  const conv = await Conversation.findOneAndUpdate(
    { pairKey: key },
    { $setOnInsert: { participants: [x, y], pairKey: key, unread: { [x.toString()]: 0, [y.toString()]: 0 } } },
    { upsert: true, new: true }
  );
  res.json({ success: true, conversationId: conv._id.toString() });
});

router.get("/conversations/:id/messages", isAuth, async (req, res) => {
  const me = req.user._id;
  const { id } = req.params;
  const { cursor, limit = 30 } = req.query;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid conversation" });
  const conv = await Conversation.findOne({ _id: id, participants: me });
  if (!conv) return res.status(404).json({ success: false, message: "Not found" });
  const q = { conversationId: id };
  if (cursor) q.createdAt = { $lt: new Date(cursor) };
  const items = await Message.find(q).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 30, 100)).lean();
  const nextCursor = items.length ? items[items.length - 1].createdAt.toISOString() : null;
  res.json({ success: true, items: items.reverse().map(msgOut), nextCursor });
});

router.post("/conversations/:id/read", isAuth, async (req, res) => {
  const me = req.user._id;
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid conversation" });
  const conv = await Conversation.findOne({ _id: id, participants: me });
  if (!conv) return res.status(404).json({ success: false, message: "Not found" });
  await Message.updateMany({ conversationId: id, to: me, readAt: null }, { $set: { readAt: new Date() } });
  const meKey = me.toString();
  if (typeof conv.unread?.get === "function") conv.unread.set(meKey, 0);
  else { conv.unread = conv.unread || {}; conv.unread[meKey] = 0; }
  await conv.save();
  res.json({ success: true });
});

router.post("/", isAuth, async (req, res) => {
  const me = req.user._id;
  const { conversationId, to, text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ success: false, message: "Empty text" });

  let conv = null;
  if (conversationId) {
    if (!mongoose.isValidObjectId(conversationId)) return res.status(400).json({ success: false, message: "Invalid conversationId" });
    conv = await Conversation.findById(conversationId);
  } else {
    if (!mongoose.isValidObjectId(to)) return res.status(400).json({ success: false, message: "Invalid recipient" });
    const { x, y, key } = pair(me, to);
    conv = await Conversation.findOneAndUpdate(
      { pairKey: key },
      { $setOnInsert: { participants: [x, y], pairKey: key, unread: { [x.toString()]: 0, [y.toString()]: 0 } } },
      { upsert: true, new: true }
    );
  }

  const peer = conv.participants.find((p) => p.toString() !== me.toString());
  const msg = await Message.create({ conversationId: conv._id, from: me, to: peer, text: text.trim() });
  conv.lastMessage = msg.text;
  conv.lastSender = me;
  const toKey = peer.toString();
  if (typeof conv.unread?.get === "function") conv.unread.set(toKey, Number(conv.unread.get(toKey) || 0) + 1);
  else { conv.unread = conv.unread || {}; conv.unread[toKey] = Number(conv.unread[toKey] || 0) + 1; }
  await conv.save();

  res.status(201).json({ success: true, message: msgOut(msg) });
});

export default router;
