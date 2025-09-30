import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "workoscdn.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      // Favicon services
      {
        protocol: "https",
        hostname: "icon.horse",
      },
      {
        protocol: "https",
        hostname: "favicons.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.faviconkit.com",
      },
      {
        protocol: "https",
        hostname: "external-content.duckduckgo.com",
      },
      // Allow any domain for favicons (with path prefix)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/favicon.*",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/apple-touch-icon.*",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/android-chrome-*",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/favicon.*",
      },
    ],
  },
};

export default nextConfig;
