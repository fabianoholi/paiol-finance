import cron from "node-cron";
import prisma from "../lib/prisma.js";

async function processScheduledPosts(): Promise<void> {
  const now = new Date();

  const duePosts = await prisma.post.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    include: { targets: true },
  });

  if (duePosts.length === 0) return;

  console.log(`[Scheduler] Found ${duePosts.length} post(s) due for publishing`);

  for (const post of duePosts) {
    try {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "published",
          publishedAt: now,
        },
      });

      if (post.targets.length > 0) {
        await prisma.postTarget.updateMany({
          where: { postId: post.id },
          data: {
            status: "published",
            publishedAt: now,
          },
        });
      }

      console.log(`[Scheduler] Published post ${post.id}`);
    } catch (err) {
      console.error(`[Scheduler] Failed to publish post ${post.id}:`, err);
    }
  }
}

export function startScheduler(): void {
  console.log("[Scheduler] Starting post scheduler (every 60s)");
  cron.schedule("* * * * *", () => {
    processScheduledPosts().catch((err) =>
      console.error("[Scheduler] Unexpected error:", err)
    );
  });
}
