import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

const O = (id) => new mongoose.Types.ObjectId(id);
const pair = (a, b) => {
  const A = O(a), B = O(b);
  const [x, y] = A.toString() < B.toString() ? [A, B] : [B, A];
  return { x, y, key: `${x.toString()}:${y.toString()}` };
};

export function initSocket(io) {
  io.use((socket, next) => {
    try {
      const raw = socket.request?.headers?.cookie || "";
      const token = raw.split(";").map((s) => s.trim()).find((s) => s.startsWith("token="))?.split("=")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded._id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("message:send", async (payload, cb) => {
      try {
        const { conversationId, to, text } = payload || {};
        if (!text || !text.trim()) return cb?.({ ok: false, error: "empty" });

        let conv = null;
        if (conversationId) {
          conv = await Conversation.findById(conversationId);
        } else if (to) {
          const { x, y, key } = pair(socket.userId, to);
          conv = await Conversation.findOneAndUpdate(
            { pairKey: key },
            { $setOnInsert: { participants: [x, y], pairKey: key, unread: { [x.toString()]: 0, [y.toString()]: 0 } } },
            { upsert: true, new: true }
          );
        }
        if (!conv) return cb?.({ ok: false, error: "not_found" });

        const peer = conv.participants.find((p) => p.toString() !== socket.userId.toString());
        const msg = await Message.create({ conversationId: conv._id, from: socket.userId, to: peer, text: text.trim() });
        conv.lastMessage = msg.text;
        conv.lastSender = socket.userId;
        const toKey = peer.toString();
        if (typeof conv.unread?.get === "function") conv.unread.set(toKey, Number(conv.unread.get(toKey) || 0) + 1);
        else { conv.unread = conv.unread || {}; conv.unread[toKey] = Number(conv.unread[toKey] || 0) + 1; }
        await conv.save();

        const out = { id: msg._id.toString(), conversationId: conv._id.toString(), from: socket.userId, to: peer.toString(), text: msg.text, readAt: null, createdAt: msg.createdAt };
        cb?.({ ok: true, message: out });
        socket.to(`user:${peer.toString()}`).emit("message:new", out);
        socket.emit("message:echo", out);
      } catch {
        cb?.({ ok: false, error: "send_failed" });
      }
    });

    socket.on("message:typing", (data) => {
      const { conversationId, to, typing } = data || {};
      socket.to(`user:${to}`).emit("message:typing", { conversationId, from: socket.userId, typing: !!typing });
    });

    socket.on("message:read", async (data) => {
      try {
        const { conversationId } = data || {};
        await Message.updateMany({ conversationId, to: socket.userId, readAt: null }, { $set: { readAt: new Date() } });
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          const meKey = socket.userId.toString();
          if (typeof conv.unread?.get === "function") conv.unread.set(meKey, 0);
          else { conv.unread = conv.unread || {}; conv.unread[meKey] = 0; }
          await conv.save();
        }
        socket.emit("message:read", { conversationId });
      } catch {}
    });
  });
}

