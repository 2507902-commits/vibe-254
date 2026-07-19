import mongoose from "mongoose";
import { KENYA_COUNTIES } from "../constants/counties.js";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    dob: { type: Date, required: true }, // enforce 18+ at signup validation
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    interestedIn: { type: String, enum: ["male", "female", "everyone"], required: true },

    // Niche targeting: student or professional
    userType: { type: String, enum: ["student", "professional"], required: true },
    institutionOrCompany: { type: String, trim: true }, // university name or workplace

    country: { type: String, required: true, default: "Kenya" }, // ISO country name
    county: { type: String, enum: KENYA_COUNTIES }, // only used when country === "Kenya"
    region: { type: String, trim: true }, // state/province/city for non-Kenya users

    bio: { type: String, maxlength: 500, default: "" },
    interests: [{ type: String }],
    photos: [{ type: String }], // Cloudinary/S3 URLs
    profileComplete: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false }, // email/phone verification
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date },

    likesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
