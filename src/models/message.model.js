import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", index: true, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
