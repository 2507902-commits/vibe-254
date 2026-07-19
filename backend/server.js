import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import matchRoutes from "./routes/match.js";
import chatRoutes from "./routes/chat.js";
import subscriptionRoutes from "./routes/subscription.js";

connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));

// Stripe webhook needs the raw request body for signature verification,
// so it must be wired up BEFORE express.json() below
app.use("/api/subscription/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", subscriptionRoutes);

app.get("/", (req, res) => res.send("Vibe254 API is running"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });

io.on("connection", (socket) => {
  socket.on("join-match", (matchId) => socket.join(matchId));

  socket.on("send-message", ({ matchId, message }) => {
    io.to(matchId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Vibe254 API running on port ${PORT}`));
// Catch background errors and print them readably instead of "[object Object]"
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err?.message || err);
  if (err?.stack) console.error(err.stack);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err?.message || err);
  if (err?.stack) console.error(err.stack);
});