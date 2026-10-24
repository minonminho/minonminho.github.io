import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emit directory/index.html for direct links to dated briefs on GitHub Pages.
  trailingSlash: true,
  // GitHub Pages 배포용 정적 내보내기 (next build → out/)
  // Live GitHub search uses the external Worker API; the resume site remains static.
};

export default nextConfig;
