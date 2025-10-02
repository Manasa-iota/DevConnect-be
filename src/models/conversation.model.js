import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true }],
    pairKey: { type: String, required: true, unique: true },
    lastMessage: { type: String, default: "" },
    lastSender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    unread: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

conversationSchema.index({ pairKey: 1 }, { unique: true });
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
