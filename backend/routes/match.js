import express from "express";
import User from "../models/User.js";
import Match from "../models/Match.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/match/discover - get candidate profiles to swipe on
router.get("/discover", protect, async (req, res) => {
  const me = await User.findById(req.userId);

  const genderFilter =
    me.interestedIn === "everyone" ? {} : { gender: me.interestedIn };

  const candidates = await User.find({
    _id: { $ne: me._id, $nin: [...me.likesSent, ...me.matches] },
    ...genderFilter,
    profileComplete: true,
  })
    .select("fullName photos bio userType institutionOrCompany county interests")
    .limit(20);

  res.json(candidates);
});

// POST /api/match/like/:id - like a profile, creates a Match if mutual
router.post("/like/:id", protect, async (req, res) => {
  const targetId = req.params.id;
  const me = await User.findById(req.userId);
  const target = await User.findById(targetId);

  if (!target) return res.status(404).json({ message: "User not found" });

  if (!me.likesSent.includes(targetId)) {
    me.likesSent.push(targetId);
    await me.save();
  }

  const isMutual = target.likesSent.includes(me._id.toString());

  if (isMutual) {
    me.matches.push(targetId);
    target.matches.push(me._id);
    await me.save();
    await target.save();

    const match = await Match.create({ users: [me._id, target._id] });
    return res.json({ matched: true, match });
  }

  target.likesReceived.push(me._id);
  await target.save();

  res.json({ matched: false });
});

// GET /api/match/mine - list my matches
router.get("/mine", protect, async (req, res) => {
  const matches = await Match.find({ users: req.userId }).populate(
    "users",
    "fullName photos"
  );
  res.json(matches);
});

export default router;
