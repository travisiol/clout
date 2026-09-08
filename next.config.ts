import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Trader avatars come from the Fomo profile bucket.
      { protocol: "https", hostname: "prod-fomo-profile-pics.s3.amazonaws.com" },
      // Token thumbnails for the "top holdings" stacks.
      { protocol: "https", hostname: "token-media.defined.fi" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
};

export default nextConfig;
