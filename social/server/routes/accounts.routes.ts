import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import platforms from "../config/platforms.js";

const router = Router();
router.use(authMiddleware);

// GET / - list connected accounts
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isActive: true,
        clientId: true,
        connectedAt: true,
      },
      orderBy: { connectedAt: "desc" },
    });
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// POST / - create account (mock/dev mode)
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { platform, username, displayName, clientId } = req.body;

    if (!platform || !username) {
      res.status(400).json({ error: "platform and username are required" });
      return;
    }

    const account = await prisma.socialAccount.create({
      data: {
        userId: req.userId!,
        platform,
        platformUserId: `mock_${username}_${Date.now()}`,
        username,
        displayName: displayName || username,
        accessToken: "mock_token",
        clientId,
      },
    });

    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// DELETE /:id - disconnect account
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.socialAccount.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    await prisma.socialAccount.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to disconnect account" });
  }
});

// GET /connect/:platform - OAuth redirect placeholder
router.get("/connect/:platform", async (req: AuthRequest, res: Response) => {
  const { platform } = req.params;
  const config = platforms[platform];

  if (!config) {
    res.status(400).json({ error: `Unsupported platform: ${platform}` });
    return;
  }

  // In production, redirect to OAuth URL with proper client_id, redirect_uri, etc.
  res.json({
    message: `OAuth flow placeholder for ${config.name}`,
    authUrl: config.authUrl,
    scopes: config.scopes,
  });
});

// GET /callback/:platform - OAuth callback placeholder
router.get("/callback/:platform", async (req: AuthRequest, res: Response) => {
  const { platform } = req.params;
  const config = platforms[platform];

  if (!config) {
    res.status(400).json({ error: `Unsupported platform: ${platform}` });
    return;
  }

  // In production, exchange code for tokens and create SocialAccount
  res.json({
    message: `OAuth callback placeholder for ${config.name}`,
    note: "In production, this would exchange the authorization code for tokens.",
  });
});

export default router;
