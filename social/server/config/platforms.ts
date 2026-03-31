export interface PlatformConfig {
  name: string;
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
  scopes: string[];
}

const platforms: Record<string, PlatformConfig> = {
  instagram: {
    name: "Instagram",
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    apiBaseUrl: "https://graph.instagram.com/v18.0",
    scopes: [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
    ],
  },
  facebook: {
    name: "Facebook",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    apiBaseUrl: "https://graph.facebook.com/v18.0",
    scopes: [
      "pages_show_list",
      "pages_manage_posts",
      "pages_read_engagement",
      "read_insights",
    ],
  },
  tiktok: {
    name: "TikTok",
    authUrl: "https://www.tiktok.com/v2/auth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token",
    apiBaseUrl: "https://open.tiktokapis.com/v2",
    scopes: ["user.info.basic", "video.publish", "video.list"],
  },
  youtube: {
    name: "YouTube",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    apiBaseUrl: "https://www.googleapis.com/youtube/v3",
    scopes: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ],
  },
  linkedin: {
    name: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    apiBaseUrl: "https://api.linkedin.com/v2",
    scopes: ["r_liteprofile", "w_member_social", "r_organization_social"],
  },
  twitter: {
    name: "Twitter / X",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    apiBaseUrl: "https://api.twitter.com/2",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },
  pinterest: {
    name: "Pinterest",
    authUrl: "https://www.pinterest.com/oauth",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    apiBaseUrl: "https://api.pinterest.com/v5",
    scopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
  },
};

export default platforms;
