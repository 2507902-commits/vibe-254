import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { KENYA_COUNTIES } from "../constants/counties.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// GET /api/profile/counties - list of valid Kenyan counties for dropdowns
router.get("/counties", (req, res) => {
  res.json(KENYA_COUNTIES);
});

// POST /api/profile/photo - upload a profile photo, save its URL to the user doc
router.post("/photo", protect, upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No photo uploaded" });

  // req.file.path is the Cloudinary-hosted URL after upload completes
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $push: { photos: req.file.path } },
    { new: true }
  ).select("-passwordHash");

  res.json({ message: "Photo uploaded", photos: user.photos });
});

// DELETE /api/profile/photo - remove a photo URL from the user's array
router.delete("/photo", protect, async (req, res) => {
  const { photoUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $pull: { photos: photoUrl } },
    { new: true }
  ).select("-passwordHash");

  res.json({ message: "Photo removed", photos: user.photos });
});

// Get my profile
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  res.json(user);
});

// Update my profile
router.put("/me", protect, async (req, res) => {
  const allowedFields = ["bio", "interests", "photos", "institutionOrCompany", "county", "profileComplete"];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-passwordHash");
  res.json(user);
});

export default router;

