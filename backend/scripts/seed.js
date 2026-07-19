// Dev/testing seed script — populates test profiles with clearly-generic
// placeholder avatars (DiceBear), NOT photorealistic fake faces.
// Never use AI-generated photorealistic people as profile photos:
// real users match against these images, so they must not look like
// real, identifiable humans that don't exist.

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { KENYA_COUNTIES } from "../constants/counties.js";

dotenv.config();

const FIRST_NAMES = ["Amina", "Brian", "Cynthia", "Dennis", "Esther", "Felix", "Grace", "Hassan", "Irene", "James"];
const INSTITUTIONS = ["University of Nairobi", "Strathmore University", "KCA University", "JKUAT", "Kenyatta University"];
const COMPANIES = ["Safaricom", "Equity Bank", "Andela", "iHub", "Twiga Foods"];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// DiceBear generates simple, obviously-illustrated avatars — not realistic faces
const avatarFor = (seed) => `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;

const seed = async (count = 30) => {
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash("testpass123", 10);

  const users = [];
  for (let i = 0; i < count; i++) {
    const name = `${randomFrom(FIRST_NAMES)} Test${i}`;
    const userType = Math.random() > 0.5 ? "student" : "professional";
    users.push({
      fullName: name,
      email: `testuser${i}@vibe254.test`,
      phone: `2547${String(10000000 + i).padStart(8, "0")}`,
      passwordHash,
      dob: new Date(1998, 0, 1),
      gender: Math.random() > 0.5 ? "male" : "female",
      interestedIn: "everyone",
      userType,
      institutionOrCompany: userType === "student" ? randomFrom(INSTITUTIONS) : randomFrom(COMPANIES),
      country: "Kenya",
      county: randomFrom(KENYA_COUNTIES),
      bio: "Just here to vibe.",
      photos: [avatarFor(name)],
      profileComplete: true,
    });
  }

  await User.insertMany(users);
  console.log(`Seeded ${count} test profiles with placeholder avatars.`);
  process.exit(0);
};

seed(30);
