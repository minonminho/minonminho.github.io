import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages 배포용 정적 내보내기 (next build → out/)
  // Live GitHub search uses the external Worker API; the resume site remains static.
};

export default nextConfig;
