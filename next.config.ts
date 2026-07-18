import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // NOT "@base-ui/react": optimizing it breaks Tooltip at runtime
    // (hover popups silently stop rendering).
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
