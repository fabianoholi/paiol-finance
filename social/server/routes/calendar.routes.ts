import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET / - get posts grouped by day for a month
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query; // YYYY-MM

    if (!month || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({ error: "month query parameter is required (format: YYYY-MM)" });
      return;
    }

    const [year, mon] = month.split("-").map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

    const posts = await prisma.post.findMany({
      where: {
        userId: req.userId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        targets: { include: { socialAccount: true } },
        client: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Group by day
    const grouped: Record<string, typeof posts> = {};
    for (const post of posts) {
      if (post.scheduledAt) {
        const dayKey = post.scheduledAt.toISOString().slice(0, 10);
        if (!grouped[dayKey]) grouped[dayKey] = [];
        grouped[dayKey].push(post);
      }
    }

    res.json({ month, days: grouped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});

// PUT /reschedule/:postId - update scheduledAt
router.put("/reschedule/:postId", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.postId, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      res.status(400).json({ error: "scheduledAt is required" });
      return;
    }

    const post = await prisma.post.update({
      where: { id: req.params.postId },
      data: {
        scheduledAt: new Date(scheduledAt),
        status: "scheduled",
      },
      include: { targets: { include: { socialAccount: true } } },
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reschedule post" });
  }
});

export default router;
