import express from "express";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { stkPush } from "../services/mpesa.js";
import stripe, { createCheckoutSession } from "../services/stripe.js";

const router = express.Router();

// POST /api/subscription/subscribe - starts payment flow based on user's country
// Kenya -> M-Pesa STK Push. Everyone else -> Stripe Checkout.
router.post("/subscribe", protect, async (req, res) => {
  const user = await User.findById(req.userId);

  if (user.country === "Kenya") {
    const { phoneNumber } = req.body; // format 2547XXXXXXXX
    if (!phoneNumber) return res.status(400).json({ message: "Phone number required" });

    try {
      const stkResponse = await stkPush(phoneNumber);
      const subscription = await Subscription.create({
        user: req.userId,
        paymentMethod: "mpesa",
        amount: 250,
        currency: "KES",
        status: "pending",
        checkoutRequestID: stkResponse.CheckoutRequestID,
      });
      return res.json({ message: "STK push sent, check your phone", subscription });
    } catch (err) {
      console.error(err.response?.data || err.message);
      return res.status(500).json({ message: "Failed to initiate M-Pesa payment" });
    }
  }

  // Non-Kenya: Stripe Checkout
  try {
    const session = await createCheckoutSession(user);
    await Subscription.create({
      user: req.userId,
      paymentMethod: "stripe",
      amount: 2, // USD equivalent of KES 250/month — adjust to your actual Stripe price
      currency: "USD",
      status: "pending",
      stripeSessionId: session.id,
    });
    return res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Failed to start Stripe checkout" });
  }
});

// POST /api/subscription/mpesa/callback - Safaricom calls this after payment
router.post("/mpesa/callback", async (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  if (!callback) return res.sendStatus(400);

  const subscription = await Subscription.findOne({
    checkoutRequestID: callback.CheckoutRequestID,
  });
  if (!subscription) return res.sendStatus(404);

  if (callback.ResultCode === 0) {
    const receipt = callback.CallbackMetadata.Item.find(
      (i) => i.Name === "MpesaReceiptNumber"
    )?.Value;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    subscription.status = "active";
    subscription.mpesaReceiptNumber = receipt;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();

    await User.findByIdAndUpdate(subscription.user, {
      isPremium: true,
      premiumExpiresAt: endDate,
    });
  } else {
    subscription.status = "failed";
    await subscription.save();
  }

  res.sendStatus(200);
});

// POST /api/subscription/stripe/webhook - Stripe calls this on checkout/payment events
// NOTE: this route needs the raw body, not JSON-parsed — see server.js wiring
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const subscription = await Subscription.findOne({ stripeSessionId: session.id });
    if (subscription) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      subscription.status = "active";
      subscription.stripeCustomerId = session.customer;
      subscription.stripeSubscriptionId = session.subscription;
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      await subscription.save();

      await User.findByIdAndUpdate(subscription.user, {
        isPremium: true,
        premiumExpiresAt: endDate,
      });
    }
  }

  res.json({ received: true });
});

export default router;
