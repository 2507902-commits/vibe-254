# Vibe254

A dating app + website for Kenyan university students and young professionals.

## Structure
- `backend/` — Node.js + Express + MongoDB API, Socket.io for real-time chat
- `frontend/` — React (Vite) client

## Features
- Auth (signup/login, 18+ enforced at signup)
- Profiles (student or professional, university/company, county, photos, bio, interests)
- Discover/swipe + mutual matching
- Real-time chat (Socket.io)
- Vibe254 Premium subscription — KES 250/month via M-Pesa (Daraja STK Push)

## Setup

### Backend
```
cd backend
cp .env.example .env   # fill in Mongo URI, JWT secret, M-Pesa Daraja credentials
npm install
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:5000.

## M-Pesa (Daraja) setup
1. Register at https://developer.safaricom.co.ke
2. Create an app, get Consumer Key/Secret
3. For sandbox testing use shortcode 174379 and the provided sandbox passkey
4. Callback URL must be publicly reachable — use ngrok for local dev

## Cloudinary (photo upload) setup
1. Create a free account at https://cloudinary.com
2. From your dashboard, copy Cloud Name, API Key, API Secret into `.env`
3. Photos upload via `POST /api/profile/photo` (multipart form, field name `photo`)
4. Cloudinary returns a hosted URL, which gets saved into the user's `photos` array in MongoDB — the image itself is never stored in the database

## International users & payments
- Signup now includes a `country` field. Kenyan users pick a county from the accurate 47-county list; everyone else enters a free-text state/province/region.
- Payment routes automatically by country: Kenya → M-Pesa STK Push (KES 250/month). Everyone else → Stripe Checkout (USD, adjust price in Stripe dashboard).
- Stripe setup:
  1. Create an account at https://dashboard.stripe.com
  2. Create a recurring monthly Price, copy its ID into `STRIPE_PRICE_ID`
  3. Get your secret key into `STRIPE_SECRET_KEY`
  4. Add a webhook endpoint pointing to `/api/subscription/stripe/webhook`, listening for `checkout.session.completed`, and copy its signing secret into `STRIPE_WEBHOOK_SECRET`
  5. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:5000/api/subscription/stripe/webhook`

## Still to build
- Push notifications for new matches/messages
- Admin dashboard / moderation tools
- Report/block user flow
- Events feature (Phase 3)
- Currency conversion beyond fixed USD price for non-Kenya users
