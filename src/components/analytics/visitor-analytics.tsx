import Script from "next/script";

// Public site identifier from the owner's Cloudflare installation snippet.
const DEFAULT_SITE_TOKEN = "11ff6239f57e4dd381b77b61fc577860";

export function VisitorAnalytics() {
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim() || DEFAULT_SITE_TOKEN;

  // Keep development traffic out of the published site's statistics.
  if (process.env.NODE_ENV !== "production") return null;

  if (!/^[a-f0-9]{32}$/i.test(token)) {
    throw new Error("NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN must be the 32-character Web Analytics site token.");
  }

  return (
    <Script
      id="cloudflare-web-analytics"
      type="module"
      crossOrigin="anonymous"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token, spa: true })}
    />
  );
}
