import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 배포용 정적 내보내기 (next build → out/)
  output: "export",
};

export default nextConfig;
