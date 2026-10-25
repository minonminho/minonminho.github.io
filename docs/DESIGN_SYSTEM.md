# Silent Precision
## Design System v2.1 - Interactive Layers

This is the implementation contract for the portfolio and Daily Brief.
`src/app/globals.css` is the source of truth for semantic colors and typography.
This revision adds functional color layers and interaction to the editorial profile.
It supersedes the flat neutral-only treatment and the earlier full-width pastel sections.

## 1. Reference direction

Reviewed live on 2026-10-25:

- [Japan air alert](https://ttang-air-alert.vividfox6.chatgpt.site/): primary user-supplied
  reference for a pale sage canvas, ivory control surfaces, a dark functional panel,
  lime highlights, coral selection states, and selection-linked detail changes.

- [Paco Coursey](https://paco.me/): editorial reference for typography-led personal
  content, generous whitespace, understated links, and unboxed groups.
- [Emil Kowalski](https://emilkowal.ski/): secondary reference for a restrained
  reading column, modest section titles, and consistent vertical rhythm.

These are visual references. Use our own React components, content, and assets.
Adapt their editorial restraint to a longer HR portfolio; retain the numbered
metadata and thin rules of Silent Precision.

## 2. Color

Use a pale sage canvas with warm ivory panels in light mode. In dark mode,
use a deep sage canvas and progressively lighter green-gray surfaces. A dark
functional panel retains its own high-contrast foreground in both modes.

| Layer | Role | Examples |
| --- | --- | --- |
| Canvas | Page background, quiet negative space | `--background` |
| Paper | Grouped content and controls | `--surface-01`: summary, search results, disclosures |
| Sage inset | Secondary content and control grouping | `--surface-02`: search toolbar, skill chips, open summary |
| Dark panel | Focused interactive content | `--feature`, `--feature-ink`, `--feature-muted` |
| Lime | Action and workflow emphasis inside the dark panel | `--lime`, `--on-lime` |
| Coral | Current practice selection | `--selection-surface`, `--selection-ink`, `--selection-border` |

Color indicates depth, grouping, and interaction. Keep the continuous page canvas;
do not turn every section into a different full-width color block. Neutral prose,
fine rules, modest headings, and Pretendard reading typography remain the foundation.
Independent functional panels may use 12-14px corners and a restrained elevation
shadow. Avoid glow, rainbow text, and decorative gradients.

```css
:root {
  color-scheme: light;
  --void: #eaf0df;
  --background: #f3f5ef;
  --foreground: var(--text-primary);

  --surface-01: #fffefa;
  --surface-02: #eaf0df;
  --surface-03: #e0e8d7;
  --graphite: #d5d4ce;
  --steel: #65717b;

  --text-primary: #172122;
  --text-secondary: #4d5e57;
  --text-tertiary: #5b685f;

  --border-subtle: #d7dfd3;
  --border-default: #82937e;
  --border-strong: #657c63;

  --signal-ice: #386479;
  --signal-orbit: #6d5d87;
  --signal-mint: #3f694f;
  --signal-dust: #a44d3d;

  --lime: #d9f68a;
  --on-lime: #24331d;
  --selection-surface: #fff0e9;
  --selection-ink: #a14a38;
  --selection-border: #ad513e;
  --feature: #142127;
  --feature-ink: #f5f7ef;
  --feature-muted: #c6d1c5;
  --feature-border: #46594c;
  --feature-inset: #21372b;

  --card: var(--surface-01);
  --card-foreground: var(--text-primary);
  --popover: var(--surface-01);
  --popover-foreground: var(--text-primary);
  --primary: var(--text-primary);
  --primary-foreground: var(--background);
  --secondary: var(--surface-02);
  --secondary-foreground: var(--text-primary);
  --muted: var(--surface-02);
  --muted-foreground: var(--text-secondary);
  --accent: var(--surface-03);
  --accent-foreground: var(--text-primary);
  --destructive: var(--signal-dust);
  --border: var(--border-default);
  --input: var(--border-strong);
  --ring: var(--signal-ice);

  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius: 6px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --void: #1d2724;
    --background: #242e2c;
    --surface-01: #2c3934;
    --surface-02: #34463b;
    --surface-03: #3c5041;
    --graphite: #465661;
    --steel: #a0afb9;
    --text-primary: #f0f4eb;
    --text-secondary: #ced8ce;
    --text-tertiary: #b9c8bd;
    --border-subtle: #506558;
    --border-default: #829e87;
    --border-strong: #afc3ae;
    --signal-ice: #b9d5e3;
    --signal-orbit: #d4c6eb;
    --signal-mint: #c6dfa8;
    --signal-dust: #f2bcaa;
    --selection-surface: #50372d;
    --selection-ink: #ffd0be;
    --selection-border: #e0a18a;

  }
}
```

The default is light. `prefers-color-scheme: dark` automatically follows the
system/browser preference, including live changes. Tailwind `dark:` follows the
same media query. `color-scheme` also adapts native controls. No client-side
storage or theme hydration is needed. Print overrides the palette with white
surfaces and dark ink, including when the system is in dark mode.

Use semantic colors for text, borders, SVGs, and states. Card/popover tokens alias
the appropriate surface and foreground. Body, secondary, tertiary, and signal
text require at least 4.5:1 contrast on the surface they use. Meaningful non-text
indicators and large text require 3:1. Low-priority structural rules may be subtle.

## 3. Type

**Pretendard Variable 1.3.9** is the shared English/Korean typeface for headings
and prose. Load the bundled WOFF2 with `next/font/local`, weights 100-900,
`display: swap`. Font loading does not depend on a runtime CDN.

| Role | Size / line height | Weight |
| --- | --- | --- |
| Profile name | 36-48px / 1.05 | 500 |
| General page title | 30-40px / 1.15 | 500 |
| Profile section heading | 16px / 24px | 500 |
| Entry title | 18px / 28px | 500 |
| Body | 16px / 1.8 | 400 |
| Compact text | 15px / 1.6 | 400 |
| Dates and supporting links | 12-14px / 1.5-2 | 400 |
| Index and technical metadata | 11px / 1.4, Geist Mono | 400-500 |

Use normal word wrapping and left alignment. Do not justify prose or use tight
tracking on body text. Prefer weights 400, 500, and 600. Technical metadata uses
Geist Mono with restrained uppercase and letter spacing.

Loader variables are `--font-pretendard` and `--font-geist-mono`. Tailwind aliases
must reference these names rather than themselves.

Font source: [Pretendard v1.3.9](https://github.com/orioncactus/pretendard/tree/v1.3.9).
License: `src/app/fonts/OFL-Pretendard.txt` (SIL Open Font License 1.1).

## 4. Layout and spacing

- Site shell: 1120px maximum, centered; 16px mobile, 24px tablet, 48px desktop gutters.
- Profile hero: 80px top / 64px bottom on smaller screens, 72px / 64px on desktop.
- At 1024px and above, hero uses a flexible identity column and 420px practice explorer.
- Profile sections: 184px title rail, 64px gap, flexible body (872px at maximum shell; panel padding keeps prose near 820px).
- Below 1024px, titles stack above the body with a 28px gap.
- Section padding: 48px on smaller screens, 56px on desktop.
- A single 1px top rule separates sections. Titles remain unboxed and neutral.
- Narrative entries stack dates, title, organization, and prose in reading order.
- Skills live in one functional panel with a sage search/filter toolbar, ivory results,
  and compact noninteractive skill chips. Do not make each skill a separate card.
- Daily Brief shares the shell, neutral palette, fonts, and link states.
  Data-heavy tools may retain their functional cards and tables.

## 5. TypeScript components

`ProfileSection` owns section landmarks, accessible heading IDs, spacing, the
responsive title/body grid, index, and a typed accent choice. The five profile
sections pass their existing content through this shared component.

`SectionHeading` renders a small colored marker, numeric index, and neutral h2.
Color is supplementary; text and numbering identify each section independently.

`Hero` presents identity, location, contact, and experience navigation beside
`PracticeExplorer`. The explorer is a client component: three real buttons select
Global HR, Talent, or Applied AI, updating description, approach steps, evidence,
and the destination link together. Buttons expose `aria-pressed` and `aria-controls`;
updated prose uses a polite live region. The panel is readable on initial server render.

`SkillExplorer` is a client component receiving canonical `SkillGroup` data. Search
is case-insensitive and trims whitespace. Search and category filters combine,
result counts are announced, and empty results offer a full reset. Chips are labels,
not fake controls. Default rendering includes all skills.

`EntryDetails` uses native `details` and `summary` for career and project entries.
The first entry in each section is open by default. Every detail remains in the DOM;
keyboard and no-JavaScript disclosure behavior work without custom state.

Navigation lists About, Skills, Experience, Education, and Side Project in that
order, then the Knowledge workspace and contact,
and native CV printing. Keep profile data in `src/lib/data.ts`.

`SideProjectsPage` lives at `/side-projects/`, with its own h1, metadata, navigation,
and footer. `DailyBriefProjectCard` opens `/daily-brief/`, including the edition
archive. The Applied AI practice action and desktop/mobile Side Project menus link
to `/side-projects/`. The menu follows Education, but the home profile itself ends
with Education. Side projects remain separate from professional Project Experience
and the print-only CV. The Side Project menu exposes `aria-current="page"` when active.

Do not place implementation terms or reference-site branding in product copy.

## 6. Interaction and accessibility

- Links use an underline, a visible focus indicator, or a clear navigation state.
- Preserve keyboard navigation, semantic headings, mobile menu, and `aria-current`.
- Keep controls at comfortable touch sizes (the shared button system is 36-44px).
- Use a 180ms CSS entry reveal only under `prefers-reduced-motion: no-preference`.
  Keep server-rendered content visible by default; do not branch initial render styles
  on a browser-only motion preference. Content stays readable without JavaScript.
- No hover-only essential content. Avoid decorative motion and spring effects.
- Home printing shows the dedicated CV; navigation and footer are hidden.

## 7. Verification

Before accepting a visual revision, inspect desktop and mobile in both schemes.
Check actual text/background contrast, wrapping, menu behavior, anchor navigation,
font loading, native printing, and the Daily Brief routes. Exercise all practice selections and destination
links, combined skill filters,
empty-state reset, and keyboard disclosure toggling. Run a production build and
TypeScript checks. Compare browser screenshots to the reference direction.
