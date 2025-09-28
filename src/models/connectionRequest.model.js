import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    to: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], required: true },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ from: 1, to: 1 }, { unique: true });
connectionRequestSchema.index({ to: 1, status: 1, createdAt: -1 });
connectionRequestSchema.index({ from: 1, status: 1, createdAt: -1 });

export const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
