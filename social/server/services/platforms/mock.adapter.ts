function randomId(): string {
  return "mock_" + Math.random().toString(36).slice(2, 12);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function publish(post: {
  id: string;
  content: string;
}): Promise<{ success: boolean; platformPostId: string }> {
  await delay(500);
  console.log(`[MockAdapter] Published post ${post.id}`);
  return {
    success: true,
    platformPostId: randomId(),
  };
}

export async function getInsights(accountId: string) {
  await delay(200);
  return {
    accountId,
    followers: Math.floor(Math.random() * 50000) + 1000,
    following: Math.floor(Math.random() * 2000) + 100,
    postsCount: Math.floor(Math.random() * 500) + 10,
    reach: Math.floor(Math.random() * 100000) + 5000,
    impressions: Math.floor(Math.random() * 200000) + 10000,
    engagementRate: parseFloat((Math.random() * 8 + 1).toFixed(2)),
    likes: Math.floor(Math.random() * 10000) + 500,
    comments: Math.floor(Math.random() * 2000) + 50,
    shares: Math.floor(Math.random() * 1000) + 20,
    saves: Math.floor(Math.random() * 500) + 10,
    profileViews: Math.floor(Math.random() * 5000) + 200,
    websiteClicks: Math.floor(Math.random() * 1000) + 50,
  };
}

export async function getProfile(accountId: string) {
  await delay(200);
  return {
    accountId,
    username: "mock_user",
    displayName: "Mock User",
    avatarUrl: "https://placehold.co/150x150",
    followers: Math.floor(Math.random() * 50000) + 1000,
    bio: "This is a mock social media profile for development.",
  };
}
