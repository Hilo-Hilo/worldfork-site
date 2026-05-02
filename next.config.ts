import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "worldfork-site.vercel.app" }],
        destination: "https://worldfork.tech/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
