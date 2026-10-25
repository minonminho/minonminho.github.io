This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

The interface follows [Silent Precision - Interactive Layers](docs/DESIGN_SYSTEM.md).
Its primary color/interaction reference is the user-supplied
[Japan air alert](https://ttang-air-alert.vividfox6.chatgpt.site/): sage canvas,
ivory panels, a dark practice explorer, and lime/coral selection states.
It also draws on the restrained personal sites of [Paco Coursey](https://paco.me/) and
[Emil Kowalski](https://emilkowal.ski/): continuous neutral surfaces, a readable
column, small section labels, thin rules, and understated links. Light/dark mode
follows the system/browser setting. Practice selection updates the detail panel and related link. Skills support combined
search/category filters; native disclosures expand career and project details.

English and Korean prose use bundled **Pretendard Variable 1.3.9** through
`next/font/local`; technical metadata uses Geist Mono. The font license is in
`src/app/fonts/OFL-Pretendard.txt`. Body text uses 16px / 1.8 for sustained reading.

The profile sections share a typed `ProfileSection` component. Existing profile
content, Daily Brief, navigation, and native CV printing are preserved.
The **Side Project** page (`/side-projects/`) contains the Daily Brief card. Desktop
and mobile navigation link to this page immediately after Education; the home
profile ends with Education.
See [design references](DESIGN-figma.md) for the current visual direction.

## Visitor analytics

Cloudflare Web Analytics is configured with the site's public token. Production
deployments collect visits and page views. See [dashboard instructions](docs/ANALYTICS.md).
Local development does not send visitor statistics.

## Learn More


To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
