import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET / - list campaigns
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        posts: {
          select: { id: true, status: true, cost: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = campaigns.map((c) => ({
      ...c,
      postCount: c.posts.length,
      posts: undefined,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// GET /overview - aggregated ad spend and performance
router.get("/overview", async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany();

    const totals = campaigns.reduce(
      (acc, c) => ({
        totalBudget: acc.totalBudget + (c.budget || 0),
        totalSpent: acc.totalSpent + (c.spent || 0),
        totalImpressions: acc.totalImpressions + c.impressions,
        totalClicks: acc.totalClicks + c.clicks,
        totalConversions: acc.totalConversions + c.conversions,
      }),
      {
        totalBudget: 0,
        totalSpent: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
      }
    );

    const avgCpc =
      totals.totalClicks > 0
        ? totals.totalSpent / totals.totalClicks
        : 0;
    const avgCpm =
      totals.totalImpressions > 0
        ? (totals.totalSpent / totals.totalImpressions) * 1000
        : 0;
    const ctr =
      totals.totalImpressions > 0
        ? (totals.totalClicks / totals.totalImpressions) * 100
        : 0;

    res.json({
      campaignCount: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      ...totals,
      avgCpc: parseFloat(avgCpc.toFixed(2)),
      avgCpm: parseFloat(avgCpm.toFixed(2)),
      ctr: parseFloat(ctr.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaign overview" });
  }
});

// GET /:id - campaign details
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        posts: {
          include: {
            targets: { include: { socialAccount: true } },
            client: true,
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

export default router;
