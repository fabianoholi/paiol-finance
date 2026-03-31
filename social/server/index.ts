import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { errorHandler } from "./middleware/errorHandler.js";
import { startScheduler } from "./services/scheduler.service.js";

import authRoutes from "./routes/auth.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import accountsRoutes from "./routes/accounts.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import competitorsRoutes from "./routes/competitors.routes.js";
import campaignsRoutes from "./routes/campaigns.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/clients", clientsRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/accounts", accountsRoutes);
app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/competitors", competitorsRoutes);
app.use("/api/v1/campaigns", campaignsRoutes);

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Paiol Social API running on http://localhost:${PORT}`);
  startScheduler();
});

export default app;
