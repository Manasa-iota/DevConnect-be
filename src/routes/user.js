import { Router } from "express";
import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { User } from "../models/user.model.js";
import { isAuth } from "../middlewares/auth.js";

const router = Router();

const toName = (u) => [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
const mapUser = (u) => ({
  id: u._id.toString(),
  name: toName(u),
  title: u.about ?? null,
  avatar: u.photoUrl ?? null,
});
const mapIncoming = (r) => ({
  id: r._id.toString(),
  from: mapUser(r.from),
  status: "pending",
  createdAt: r.createdAt,
});
const mapOutgoing = (r) => ({
  id: r._id.toString(),
  toUser: mapUser(r.to),
  status: "pending",
  createdAt: r.createdAt,
});
const mapConnection = (r, meId) => ({
  id: r._id.toString(),
  peer: mapUser(r.from._id.equals(meId) ? r.to : r.from),
  createdAt: r.createdAt,
});

router.get("/requests", isAuth, async (req, res) => {
  try {
    const me = req.user._id;
    const incoming = await ConnectionRequest.find({ to: me, status: "pending" })
      .populate("from", "firstName lastName photoUrl about")
      .lean();
    const outgoing = await ConnectionRequest.find({ from: me, status: "pending" })
      .populate("to", "firstName lastName photoUrl about")
      .lean();

    return res.status(200).json({
      success: true,
      incoming: incoming.map(mapIncoming),
      outgoing: outgoing.map(mapOutgoing),
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/connections", isAuth, async (req, res) => {
  try {
    const me = req.user._id;
    const docs = await ConnectionRequest.find({
      $or: [
        { to: me, status: "accepted" },
        { from: me, status: "accepted" },
      ],
    })
      .populate("from to", "firstName lastName photoUrl about")
      .lean();

    return res.status(200).json({
      success: true,
      items: docs.map((d) => mapConnection(d, me)),
      nextCursor: null,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/feed", isAuth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    let limit = Number.parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const edges = await ConnectionRequest.find({
      $or: [{ to: req.user._id }, { from: req.user._id }],
    }).select("from to");
    const excludedIds = edges.map((e) => (e.to.equals(req.user._id) ? e.from : e.to));
    excludedIds.push(req.user._id);

    const items = await User.find({ _id: { $nin: excludedIds } })
      .select("firstName lastName photoUrl about")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      items: items.map((u) => ({
        id: u._id.toString(),
        name: toName(u),
        title: u.about ?? null,
        avatar: u.photoUrl ?? null,
        bio: u.about ?? null,
      })),
      page,
      limit,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
