import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow product photos from your Cloudinary account only
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/dohjyratj/**" },
    ],
  },
};

export default nextConfig;