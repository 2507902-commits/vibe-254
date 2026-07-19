import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const isAdult = (dobString) => {
  const dob = new Date(dobString);
  const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return age >= 18;
};

// @route POST /api/auth/signup
router.post(
  "/signup",
  [
    body("fullName").notEmpty(),
    body("email").isEmail(),
    body("phone").notEmpty(),
    body("password").isLength({ min: 6 }),
    body("dob").notEmpty(),
    body("gender").isIn(["male", "female", "other"]),
    body("interestedIn").isIn(["male", "female", "everyone"]),
    body("userType").isIn(["student", "professional"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, phone, password, dob, gender, interestedIn, userType, institutionOrCompany, county } = req.body;

    if (!isAdult(dob)) {
      return res.status(400).json({ message: "You must be 18 or older to join Vibe254" });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      dob,
      gender,
      interestedIn,
      userType,
      institutionOrCompany,
      county,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  }
);

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  res.json({
    token: generateToken(user._id),
    user: { id: user._id, fullName: user.fullName, email: user.email, isPremium: user.isPremium },
  });
});

export default router;
