import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET /overview - aggregated metrics across all accounts
router.get("/overview", async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.userId, isActive: true },
      select: { id: true, platform: true, username: true },
    });

    const accountIds = accounts.map((a) => a.id);

    // Get latest snapshot per account
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { socialAccountId: { in: accountIds } },
      orderBy: { date: "desc" },
      distinct: ["socialAccountId"],
    });

    const totals = snapshots.reduce(
      (acc, s) => ({
        followers: acc.followers + s.followers,
        reach: acc.reach + s.reach,
        impressions: acc.impressions + s.impressions,
        likes: acc.likes + s.likes,
        comments: acc.comments + s.comments,
        shares: acc.shares + s.shares,
        saves: acc.saves + s.saves,
        profileViews: acc.profileViews + s.profileViews,
        websiteClicks: acc.websiteClicks + s.websiteClicks,
      }),
      {
        followers: 0,
        reach: 0,
        impressions: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        profileViews: 0,
        websiteClicks: 0,
      }
    );

    const avgEngagementRate =
      snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + s.engagementRate, 0) /
          snapshots.length
        : 0;

    res.json({
      accountCount: accounts.length,
      ...totals,
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
});

// GET /account/:accountId - metrics for single account with date range
router.get("/account/:accountId", async (req: AuthRequest, res: Response) => {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: { id: req.params.accountId, userId: req.userId },
    });

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    const { from, to } = req.query;
    const where: any = { socialAccountId: req.params.accountId };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { date: "asc" },
    });

    res.json({
      account: {
        id: account.id,
        platform: account.platform,
        username: account.username,
        displayName: account.displayName,
      },
      snapshots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch account analytics" });
  }
});

// GET /top-posts - top performing posts by engagement
router.get("/top-posts", async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const targets = await prisma.postTarget.findMany({
      where: {
        post: { userId: req.userId },
        status: "published",
        engagementData: { not: null },
      },
      include: {
        post: true,
        socialAccount: {
          select: { platform: true, username: true },
        },
      },
    });

    // Parse engagement and sort by total engagement
    const ranked = targets
      .map((t) => {
        const data = t.engagementData ? JSON.parse(t.engagementData) : {};
        const totalEngagement =
          (data.likes || 0) +
          (data.comments || 0) +
          (data.shares || 0) +
          (data.saves || 0);
        return {
          postId: t.postId,
          targetId: t.id,
          content: t.post.content,
          platform: t.socialAccount.platform,
          username: t.socialAccount.username,
          publishedAt: t.publishedAt,
          engagement: data,
          totalEngagement,
        };
      })
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, limit);

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top posts" });
  }
});

// GET /growth - follower growth over time
router.get("/growth", async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, accountId } = req.query;

    const accountWhere: any = { userId: req.userId, isActive: true };
    if (accountId) accountWhere.id = accountId;

    const accounts = await prisma.socialAccount.findMany({
      where: accountWhere,
      select: { id: true, platform: true, username: true },
    });

    const accountIds = accounts.map((a) => a.id);

    const dateWhere: any = { socialAccountId: { in: accountIds } };
    if (from || to) {
      dateWhere.date = {};
      if (from) dateWhere.date.gte = new Date(from as string);
      if (to) dateWhere.date.lte = new Date(to as string);
    }

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: dateWhere,
      orderBy: { date: "asc" },
      select: {
        socialAccountId: true,
        date: true,
        followers: true,
      },
    });

    // Group by account
    const growth: Record<string, { date: string; followers: number }[]> = {};
    for (const snap of snapshots) {
      if (!growth[snap.socialAccountId]) growth[snap.socialAccountId] = [];
      growth[snap.socialAccountId].push({
        date: snap.date.toISOString().slice(0, 10),
        followers: snap.followers,
      });
    }

    const result = accounts.map((a) => ({
      accountId: a.id,
      platform: a.platform,
      username: a.username,
      data: growth[a.id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch growth data" });
  }
});

export default router;
