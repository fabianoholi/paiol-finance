import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import * as mockAdapter from "../services/platforms/mock.adapter.js";

const router = Router();
router.use(authMiddleware);

// GET / - list posts with filters
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { status, clientId, from, to } = req.query;

    const where: any = { userId: req.userId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from as string);
      if (to) where.scheduledAt.lte = new Date(to as string);
    }

    const posts = await prisma.post.findMany({
      where,
      include: { targets: { include: { socialAccount: true } }, client: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// POST / - create post
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const {
      content,
      mediaUrls,
      mediaType,
      status,
      scheduledAt,
      clientId,
      cost,
      tags,
      campaignId,
      socialAccountIds,
    } = req.body;

    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId!,
        content,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : undefined,
        mediaType,
        status: status || "draft",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        clientId,
        cost: cost ? parseFloat(cost) : 0,
        tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : undefined,
        campaignId,
        targets:
          socialAccountIds && socialAccountIds.length > 0
            ? {
                create: socialAccountIds.map((accountId: string) => ({
                  socialAccountId: accountId,
                })),
              }
            : undefined,
      },
      include: { targets: { include: { socialAccount: true } } },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /:id - update post
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const {
      content,
      mediaUrls,
      mediaType,
      status,
      scheduledAt,
      clientId,
      cost,
      tags,
      campaignId,
      socialAccountIds,
    } = req.body;

    // If socialAccountIds provided, replace all targets
    if (socialAccountIds) {
      await prisma.postTarget.deleteMany({ where: { postId: req.params.id } });
      if (socialAccountIds.length > 0) {
        await prisma.postTarget.createMany({
          data: socialAccountIds.map((accountId: string) => ({
            postId: req.params.id,
            socialAccountId: accountId,
          })),
        });
      }
    }

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...(content !== undefined && { content }),
        ...(mediaUrls !== undefined && {
          mediaUrls: JSON.stringify(mediaUrls),
        }),
        ...(mediaType !== undefined && { mediaType }),
        ...(status !== undefined && { status }),
        ...(scheduledAt !== undefined && {
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        }),
        ...(clientId !== undefined && { clientId }),
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(tags !== undefined && {
          tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
        }),
        ...(campaignId !== undefined && { campaignId }),
      },
      include: { targets: { include: { socialAccount: true } } },
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /:id - delete post
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// POST /:id/publish - publish immediately
router.post("/:id/publish", async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { targets: true },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const results = [];
    for (const target of post.targets) {
      const result = await mockAdapter.publish({
        id: post.id,
        content: post.content,
      });

      await prisma.postTarget.update({
        where: { id: target.id },
        data: {
          status: "published",
          platformPostId: result.platformPostId,
          publishedAt: new Date(),
        },
      });

      results.push({
        targetId: target.id,
        socialAccountId: target.socialAccountId,
        ...result,
      });
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { status: "published", publishedAt: new Date() },
      include: { targets: { include: { socialAccount: true } } },
    });

    res.json({ post: updated, publishResults: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to publish post" });
  }
});

// GET /:id/engagement - get engagement data
router.get("/:id/engagement", async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { targets: { include: { socialAccount: true } } },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const engagement = post.targets.map((target) => ({
      targetId: target.id,
      socialAccountId: target.socialAccountId,
      platform: target.socialAccount.platform,
      username: target.socialAccount.username,
      status: target.status,
      platformPostId: target.platformPostId,
      engagementData: target.engagementData
        ? JSON.parse(target.engagementData)
        : null,
    }));

    res.json({ postId: post.id, engagement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch engagement data" });
  }
});

export default router;
