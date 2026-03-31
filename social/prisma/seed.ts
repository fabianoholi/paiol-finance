import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

const postContents = [
  "Novo lançamento! Confira nossa coleção exclusiva de verão 🌞 #moda #verao",
  "Transformação incrível! Antes e depois do nosso tratamento capilar ✨ #cabelo #transformacao",
  "Dica do dia: como manter seu pet saudável durante o calor 🐾 #pets #dicas",
  "Resultados reais de clientes reais. Agende sua consulta! 💪 #resultados #saude",
  "Novidade na loja! Produtos com desconto especial essa semana 🛍️ #promo #desconto",
  "Bastidores da nossa sessão de fotos de hoje 📸 #backstage #fotografia",
  "Tutorial: 3 penteados fáceis para o dia a dia 💇‍♀️ #tutorial #penteado",
  "Nosso espaço pet-friendly! Traga seu melhor amigo 🐕 #petfriendly #cafe",
  "Depoimento da cliente @maria: 'Amei o resultado!' ⭐ #depoimento #cliente",
  "Promoção relâmpago! Só hoje, 30% off em todos os serviços ⚡ #promocao",
  "Conheça nossa nova linha de produtos naturais 🌿 #natural #organico",
  "Feliz com o resultado desse projeto! Obrigado pela confiança 🙏 #projeto #design",
  "Dicas de cuidados com a pele no inverno ❄️ #skincare #inverno",
  "Novo cardápio disponível! Venha experimentar 🍽️ #gastronomia #novidade",
  "Workshop gratuito neste sábado! Vagas limitadas 📚 #workshop #educacao",
  "Antes e depois da reforma do escritório 🏢 #reforma #decoracao",
  "Parceria especial com @marca para vocês! 🤝 #parceria #collab",
  "Nosso time cresceu! Bem-vinda @nova_colega 👋 #equipe #bemvinda",
  "Fechamento do mês: metas batidas! 🎯 #resultados #metas",
  "Agradecemos a todos os clientes pela confiança em 2026! ❤️ #obrigado #clientes",
];

async function main() {
  console.log("Cleaning database...");

  await prisma.postTarget.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.competitorSnapshot.deleteMany();
  await prisma.report.deleteMany();
  await prisma.clickUpTask.deleteMany();
  await prisma.post.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding...");

  // --- User ---
  const passwordHash = await bcrypt.hash("123456", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@paiol.com",
      name: "Fabiano",
      passwordHash,
    },
  });
  console.log(`Created user: ${user.email}`);

  // --- Clients ---
  const involt = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Involt",
      company: "Involt Tecnologia Ltda",
      contactEmail: "contato@involt.com.br",
      contactPhone: "(11) 99999-1234",
      notes: "Cliente desde 2024. Foco em redes sociais e conteúdo tech.",
      monthlyBudget: 3000,
      costPerPost: 50,
    },
  });

  const saHair = await prisma.client.create({
    data: {
      userId: user.id,
      name: "SA Hair",
      company: "SA Hair Studio",
      contactEmail: "agenda@sahair.com.br",
      contactPhone: "(11) 98888-5678",
      notes: "Salão de beleza premium. Conteúdo visual é prioridade.",
      monthlyBudget: 2100,
      costPerPost: 35,
    },
  });

  const reddogz = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Reddogz",
      company: "Reddogz Pet Shop",
      contactEmail: "marketing@reddogz.com.br",
      contactPhone: "(11) 97777-9012",
      notes: "Pet shop com foco em produtos premium. Público engajado.",
      monthlyBudget: 2400,
      costPerPost: 40,
    },
  });

  const clients = [involt, saHair, reddogz];
  console.log(`Created ${clients.length} clients`);

  // --- Social Accounts ---
  const socialAccounts = await Promise.all([
    prisma.socialAccount.create({
      data: {
        userId: user.id,
        clientId: involt.id,
        platform: "instagram",
        platformUserId: "ig_involt_001",
        username: "involt.tech",
        displayName: "Involt Tecnologia",
        accessToken: "mock_access_token_ig_involt",
        refreshToken: "mock_refresh_token_ig_involt",
        tokenExpiresAt: new Date("2026-06-30"),
        scopes: "basic,publish,insights",
      },
    }),
    prisma.socialAccount.create({
      data: {
        userId: user.id,
        clientId: involt.id,
        platform: "facebook",
        platformUserId: "fb_involt_001",
        username: "InvoltTech",
        displayName: "Involt Tecnologia",
        accessToken: "mock_access_token_fb_involt",
        refreshToken: "mock_refresh_token_fb_involt",
        tokenExpiresAt: new Date("2026-06-30"),
        scopes: "pages_manage_posts,pages_read_engagement",
      },
    }),
    prisma.socialAccount.create({
      data: {
        userId: user.id,
        clientId: saHair.id,
        platform: "instagram",
        platformUserId: "ig_sahair_001",
        username: "sa.hair.studio",
        displayName: "SA Hair Studio",
        accessToken: "mock_access_token_ig_sahair",
        refreshToken: "mock_refresh_token_ig_sahair",
        tokenExpiresAt: new Date("2026-06-30"),
        scopes: "basic,publish,insights",
      },
    }),
    prisma.socialAccount.create({
      data: {
        userId: user.id,
        clientId: saHair.id,
        platform: "tiktok",
        platformUserId: "tt_sahair_001",
        username: "sahair_studio",
        displayName: "SA Hair Studio",
        accessToken: "mock_access_token_tt_sahair",
        scopes: "video.upload,video.list",
      },
    }),
    prisma.socialAccount.create({
      data: {
        userId: user.id,
        clientId: reddogz.id,
        platform: "instagram",
        platformUserId: "ig_reddogz_001",
        username: "reddogz.pet",
        displayName: "Reddogz Pet Shop",
        accessToken: "mock_access_token_ig_reddogz",
        refreshToken: "mock_refresh_token_ig_reddogz",
        tokenExpiresAt: new Date("2026-06-30"),
        scopes: "basic,publish,insights",
      },
    }),
  ]);
  console.log(`Created ${socialAccounts.length} social accounts`);

  // --- Campaigns ---
  const metaCampaign = await prisma.campaign.create({
    data: {
      name: "Meta Ads - Involt Março 2026",
      platform: "meta",
      externalId: "meta_camp_120948573",
      status: "active",
      budget: 2500,
      spent: 1847.32,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-31"),
      impressions: 187430,
      clicks: 4218,
      conversions: 156,
      cpc: 0.44,
      cpm: 9.86,
      roas: 3.2,
    },
  });

  const googleCampaign = await prisma.campaign.create({
    data: {
      name: "Google Ads - SA Hair Março 2026",
      platform: "google",
      externalId: "gads_camp_9847261",
      status: "active",
      budget: 1800,
      spent: 1234.56,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-31"),
      impressions: 95620,
      clicks: 2847,
      conversions: 89,
      cpc: 0.43,
      cpm: 12.91,
      roas: 2.8,
    },
  });
  console.log("Created 2 campaigns");

  // --- Posts ---
  const statuses = ["draft", "scheduled", "published", "published", "published"];
  const posts = [];

  for (let i = 0; i < 20; i++) {
    const status = statuses[i % statuses.length];
    const clientIdx = i % 3;
    const client = clients[clientIdx];
    const daysBack = randomBetween(0, 30);
    const createdDate = daysAgo(daysBack);

    const isPublished = status === "published";
    const isScheduled = status === "scheduled";
    const campaignLink =
      i < 3 ? metaCampaign.id : i < 5 ? googleCampaign.id : undefined;

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        clientId: client.id,
        content: postContents[i],
        mediaType: i % 3 === 0 ? "image" : i % 3 === 1 ? "video" : "carousel",
        mediaUrls:
          i % 3 === 0
            ? JSON.stringify([`https://storage.paiol.com/media/post_${i}_1.jpg`])
            : i % 3 === 1
              ? JSON.stringify([`https://storage.paiol.com/media/post_${i}_1.mp4`])
              : JSON.stringify([
                  `https://storage.paiol.com/media/post_${i}_1.jpg`,
                  `https://storage.paiol.com/media/post_${i}_2.jpg`,
                  `https://storage.paiol.com/media/post_${i}_3.jpg`,
                ]),
        status,
        scheduledAt: isScheduled
          ? new Date(Date.now() + randomBetween(1, 7) * 86400000)
          : undefined,
        publishedAt: isPublished ? createdDate : undefined,
        cost: isPublished ? client.costPerPost : 0,
        tags: JSON.stringify(
          ["social", "marketing", clientIdx === 0 ? "tech" : clientIdx === 1 ? "beauty" : "pets"].slice(
            0,
            randomBetween(1, 3),
          ),
        ),
        campaignId: campaignLink,
        createdAt: createdDate,
      },
    });
    posts.push(post);

    // Create PostTarget for published and scheduled posts
    if (status !== "draft") {
      const accountsForClient = socialAccounts.filter(
        (a) => a.clientId === client.id,
      );
      if (accountsForClient.length > 0) {
        const targetAccount =
          accountsForClient[i % accountsForClient.length];
        await prisma.postTarget.create({
          data: {
            postId: post.id,
            socialAccountId: targetAccount.id,
            platformPostId: isPublished
              ? `platform_post_${Date.now()}_${i}`
              : undefined,
            status: isPublished ? "published" : "pending",
            publishedAt: isPublished ? createdDate : undefined,
            engagementData: isPublished
              ? JSON.stringify({
                  likes: randomBetween(20, 500),
                  comments: randomBetween(2, 60),
                  shares: randomBetween(0, 30),
                  saves: randomBetween(5, 80),
                })
              : undefined,
          },
        });
      }
    }
  }
  console.log(`Created ${posts.length} posts with targets`);

  // --- Analytics Snapshots (90 days per account) ---
  const baseFollowers: Record<string, number> = {
    "involt.tech": 4200,
    InvoltTech: 3100,
    "sa.hair.studio": 8700,
    sahair_studio: 2300,
    "reddogz.pet": 6100,
  };

  let snapshotCount = 0;
  for (const account of socialAccounts) {
    const base = baseFollowers[account.username] ?? 3000;

    for (let day = 90; day >= 0; day--) {
      const date = daysAgo(day);
      const dayIndex = 90 - day;

      // Gradual growth with some daily noise
      const growthRate = randomFloat(0.001, 0.005);
      const followers = Math.floor(
        base * (1 + growthRate * dayIndex) + randomBetween(-15, 25),
      );
      const following = Math.floor(base * 0.15 + randomBetween(-5, 10));
      const postsCount = Math.floor(150 + dayIndex * 0.3);

      // Engagement varies by day of week and random factors
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const reachMultiplier = isWeekend ? 1.3 : 1.0;

      const reach = Math.floor(
        followers * randomFloat(0.15, 0.35) * reachMultiplier,
      );
      const impressions = Math.floor(reach * randomFloat(1.3, 2.0));
      const likes = Math.floor(reach * randomFloat(0.03, 0.12));
      const comments = Math.floor(likes * randomFloat(0.05, 0.2));
      const shares = Math.floor(likes * randomFloat(0.02, 0.1));
      const saves = Math.floor(likes * randomFloat(0.05, 0.15));
      const engagementRate = parseFloat(
        (((likes + comments + shares + saves) / reach) * 100).toFixed(2),
      );
      const profileViews = Math.floor(reach * randomFloat(0.01, 0.05));
      const websiteClicks = Math.floor(profileViews * randomFloat(0.05, 0.2));

      await prisma.analyticsSnapshot.create({
        data: {
          socialAccountId: account.id,
          date,
          followers,
          following,
          postsCount,
          reach,
          impressions,
          engagementRate: isNaN(engagementRate) ? 0 : engagementRate,
          likes,
          comments,
          shares,
          saves,
          profileViews,
          websiteClicks,
        },
      });
      snapshotCount++;
    }
  }
  console.log(`Created ${snapshotCount} analytics snapshots`);

  // --- Competitors ---
  const competitors = await Promise.all([
    prisma.competitor.create({
      data: {
        userId: user.id,
        platform: "instagram",
        username: "concorrente.tech",
        displayName: "TechCorp Brasil",
      },
    }),
    prisma.competitor.create({
      data: {
        userId: user.id,
        platform: "instagram",
        username: "beauty.salon.sp",
        displayName: "Beauty Salon SP",
      },
    }),
    prisma.competitor.create({
      data: {
        userId: user.id,
        platform: "instagram",
        username: "megapet.store",
        displayName: "MegaPet Store",
      },
    }),
  ]);

  const competitorBases = [12500, 15800, 9300];
  let compSnapshotCount = 0;

  for (let c = 0; c < competitors.length; c++) {
    const comp = competitors[c];
    const base = competitorBases[c];

    for (let day = 30; day >= 0; day--) {
      const date = daysAgo(day);
      const dayIndex = 30 - day;

      const followers = Math.floor(
        base * (1 + 0.002 * dayIndex) + randomBetween(-30, 40),
      );
      const postsCount = Math.floor(320 + dayIndex * 0.5);
      const engagementRate = randomFloat(1.5, 5.5);
      const avgLikes = Math.floor(followers * randomFloat(0.02, 0.06));
      const avgComments = Math.floor(avgLikes * randomFloat(0.05, 0.15));

      await prisma.competitorSnapshot.create({
        data: {
          competitorId: comp.id,
          date,
          followers,
          postsCount,
          engagementRate,
          avgLikes,
          avgComments,
          topPostUrl: `https://instagram.com/p/mock_${comp.username}_${dayIndex}`,
        },
      });
      compSnapshotCount++;
    }
  }
  console.log(
    `Created ${competitors.length} competitors with ${compSnapshotCount} snapshots`,
  );

  // --- Reports ---
  await prisma.report.createMany({
    data: [
      {
        userId: user.id,
        name: "Relatório Mensal - Março 2026",
        type: "monthly",
        config: JSON.stringify({
          month: "2026-03",
          clients: [involt.id, saHair.id, reddogz.id],
          includeCompetitors: true,
          includeCampaigns: true,
        }),
      },
      {
        userId: user.id,
        name: "Análise Semanal - Semana 13",
        type: "weekly",
        config: JSON.stringify({
          week: "2026-W13",
          clients: [involt.id],
          metrics: ["engagement", "reach", "followers"],
        }),
      },
    ],
  });
  console.log("Created 2 reports");

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
