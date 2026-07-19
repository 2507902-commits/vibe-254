import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: { type: String, enum: ["mpesa", "stripe"], required: true },
    amount: { type: Number, required: true }, // 250 for KES, or USD-equivalent for Stripe
    currency: { type: String, enum: ["KES", "USD"], required: true },
    status: { type: String, enum: ["pending", "active", "expired", "failed"], default: "pending" },

    // M-Pesa fields
    mpesaReceiptNumber: { type: String },
    checkoutRequestID: { type: String },

    // Stripe fields
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeSessionId: { type: String },

    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
