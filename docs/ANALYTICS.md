# Visitor analytics

The portfolio uses Cloudflare Web Analytics to collect visits, page views, and
page performance metrics. Reports live in the owner's Cloudflare dashboard;
there is no public counter or analytics credential in the interface.

## Configuration and dashboard

The owner's public site token is configured as `DEFAULT_SITE_TOKEN` in
`src/components/analytics/visitor-analytics.tsx`. A normal production build includes
the beacon without any additional account setup or repository variable.

To use another site token, set `CLOUDFLARE_WEB_ANALYTICS_TOKEN` in the GitHub
repository's **Settings > Secrets and variables > Actions > Variables**. The build
workflow maps this optional override to `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`.
An empty or missing override uses the configured default token.

For local production builds, the same optional public environment variable can
be set in `.env.local` or the build environment. Changing it requires rebuilding.
This value is a public site identifier, not an account API token. Do not put an
account API key or password in it.

After deploying the source changes:

1. Open the published site and navigate through Side Project and Daily Brief.
2. In the [Cloudflare dashboard](https://dash.cloudflare.com/), open **Web Analytics**
   and choose `minonminho.github.io`.
3. Review visits, page views, and page paths. Data can take a few minutes to appear.
   A successful local build verifies integration, not receipt in the live dashboard.

The site remains on GitHub Pages. No DNS or hosting migration is necessary.

## Behavior

- The root layout mounts one `VisitorAnalytics` instance for every route.
- Next.js loads the beacon after hydration with `next/script`; it is shared across
  client navigation rather than reinjected for each page.
- `spa: true` enables Cloudflare's built-in tracking for client route transitions.
  Do not add a second manual page-view event handler or duplicate script snippet.
- Development builds load no analytics script. Production builds use the configured
  public site token unless a nonempty environment override is supplied.
- A nonempty malformed token fails the production build with a configuration error.
- Analytics does not block the site UI. Script blockers may prevent collection.
- The beacon contains the public site token. Dashboard access requires the owner's
  Cloudflare login. Dashboard API credentials are never sent to browsers.

These are browser analytics measurements, not a guaranteed count of every unique
person or a reconstruction of traffic before analytics was enabled.

## References

- [Manual setup for sites outside Cloudflare](https://developers.cloudflare.com/web-analytics/get-started/)
- [Web Analytics overview](https://developers.cloudflare.com/web-analytics/about/)
- [SPA navigation tracking](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/)
