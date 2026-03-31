import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET / - list clients
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// POST / - create client
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, contactEmail, contactPhone, notes, monthlyBudget, costPerPost } =
      req.body;

    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const client = await prisma.client.create({
      data: {
        userId: req.userId!,
        name,
        company,
        contactEmail,
        contactPhone,
        notes,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
        costPerPost: costPerPost ? parseFloat(costPerPost) : 0,
      },
    });

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// PUT /:id - update client
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    const { name, company, contactEmail, contactPhone, notes, monthlyBudget, costPerPost, isActive } =
      req.body;

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(company !== undefined && { company }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(notes !== undefined && { notes }),
        ...(monthlyBudget !== undefined && { monthlyBudget: parseFloat(monthlyBudget) }),
        ...(costPerPost !== undefined && { costPerPost: parseFloat(costPerPost) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// DELETE /:id - delete client
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

// GET /:id/costs - cost summary
router.get("/:id/costs", async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    const posts = await prisma.post.findMany({
      where: { clientId: req.params.id },
      select: { cost: true },
    });

    const totalPosts = posts.length;
    const totalCost = posts.reduce((sum, p) => sum + p.cost, 0);
    const avgCost = totalPosts > 0 ? totalCost / totalPosts : 0;

    res.json({
      clientId: req.params.id,
      totalPosts,
      totalCost: parseFloat(totalCost.toFixed(2)),
      avgCost: parseFloat(avgCost.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cost summary" });
  }
});

export default router;
