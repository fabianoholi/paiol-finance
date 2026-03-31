import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET / - list competitors
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const competitors = await prisma.competitor.findMany({
      where: { userId: req.userId },
      include: {
        snapshots: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(competitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch competitors" });
  }
});

// POST / - add competitor
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { platform, username, displayName, avatarUrl } = req.body;

    if (!platform || !username) {
      res.status(400).json({ error: "platform and username are required" });
      return;
    }

    const competitor = await prisma.competitor.create({
      data: {
        userId: req.userId!,
        platform,
        username,
        displayName: displayName || username,
        avatarUrl,
      },
    });

    res.status(201).json(competitor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add competitor" });
  }
});

// DELETE /:id - remove competitor
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.competitor.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Competitor not found" });
      return;
    }

    await prisma.competitor.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove competitor" });
  }
});

// GET /:id/history - metric history
router.get("/:id/history", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.competitor.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Competitor not found" });
      return;
    }

    const snapshots = await prisma.competitorSnapshot.findMany({
      where: { competitorId: req.params.id },
      orderBy: { date: "asc" },
    });

    res.json({
      competitor: existing,
      snapshots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch competitor history" });
  }
});

// GET /compare - side-by-side comparison
router.get("/compare", async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
      res.status(400).json({ error: "ids query parameter is required (comma-separated)" });
      return;
    }

    const idList = ids.split(",").map((id) => id.trim());

    const competitors = await prisma.competitor.findMany({
      where: {
        id: { in: idList },
        userId: req.userId,
      },
      include: {
        snapshots: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    const comparison = competitors.map((c) => {
      const latest = c.snapshots[0] || null;
      return {
        id: c.id,
        platform: c.platform,
        username: c.username,
        displayName: c.displayName,
        followers: latest?.followers || 0,
        postsCount: latest?.postsCount || 0,
        engagementRate: latest?.engagementRate || 0,
        avgLikes: latest?.avgLikes || 0,
        avgComments: latest?.avgComments || 0,
        snapshotDate: latest?.date || null,
      };
    });

    res.json(comparison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compare competitors" });
  }
});

export default router;
