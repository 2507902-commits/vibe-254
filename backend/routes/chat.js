import express from "express";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/chat/:matchId - get message history for a match
router.get("/:matchId", protect, async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  if (!match || !match.users.map(String).includes(req.userId)) {
    return res.status(403).json({ message: "Not part of this match" });
  }

  const messages = await Message.find({ matchId: req.params.matchId }).sort("createdAt");
  res.json(messages);
});

// POST /api/chat/:matchId - send a message (also emitted via socket.io in server.js)
router.post("/:matchId", protect, async (req, res) => {
  const { text } = req.body;
  const match = await Match.findById(req.params.matchId);
  if (!match || !match.users.map(String).includes(req.userId)) {
    return res.status(403).json({ message: "Not part of this match" });
  }

  const message = await Message.create({
    matchId: req.params.matchId,
    sender: req.userId,
    text,
  });

  match.lastMessageAt = new Date();
  await match.save();

  res.status(201).json(message);
});

export default router;
