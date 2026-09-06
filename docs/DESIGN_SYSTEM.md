# SILENT PRECISION
## Design System v1.0

This document defines the implementation rules for the Silent Precision design language.

All UI generated for this project should follow these rules unless explicitly overridden.

---

# 01. Color Tokens

## Foundation

```css
:root {
  --void: #08090B;
  --background: #0B0D0F;

  --surface-01: #101215;
  --surface-02: #15181C;
  --surface-03: #1C2025;

  --graphite: #292D32;
  --steel: #626971;

  --text-primary: #ECEFF1;
  --text-secondary: #A7ADB4;
  --text-tertiary: #676E76;

  --border-subtle: #2B3138;
  --border-default: #464F59;
  --border-strong: #5A6570;
}
```

Pure `#000000` and `#FFFFFF` should rarely be used.

Darkness should contain visible layers.

---

# 02. Signal Colors

Pastel colors are reserved for information.

```css
:root {
  --signal-ice: #A9C7D8;
  --signal-orbit: #B9B2D8;
  --signal-mint: #AFCDBE;
  --signal-dust: #D1B1B7;
}
```

Signal colors may indicate:

- active states
- categories
- selections
- data series
- system status
- important information

Do not use multiple signal colors without semantic reason.

Large areas of pastel color are discouraged.

---

# 03. Typography

Primary:

```css
font-family:
  Inter,
  Pretendard,
  "Noto Sans KR",
  system-ui,
  sans-serif;
```

Technical:

```css
font-family:
  "JetBrains Mono",
  "SFMono-Regular",
  monospace;
```

Use monospace for:

- IDs
- timestamps
- coordinates
- scores
- versions
- technical metadata

---

# 04. Type Scale

```text
Display      56px / 1.05
H1           40px / 1.15
H2           30px / 1.2
H3           22px / 1.3

Body Large   18px / 1.6
Body         15px / 1.6
Small        13px / 1.5
Metadata     11px / 1.4
```

Prefer weights:

```text
400
500
600
```

Avoid heavy typography unless deliberately required.

---

# 05. Metadata Style

Metadata is a signature element.

Example:

```text
PROJECT / 003

STATUS          ACTIVE
VERSION         1.4.2
UPDATED         2026.09.04
```

Recommended styling:

```css
font-family: monospace;
font-size: 11px;
letter-spacing: 0.08em;
text-transform: uppercase;
color: var(--text-tertiary);
```

Do not overuse metadata.

It should reward closer inspection.

---

# 06. Spacing

Base spacing system:

```text
4
8
12
16
24
32
48
64
96
128
160
```

Standard UI spacing:

```text
8 / 16 / 24 / 32
```

Major sections:

```text
96 / 128 / 160
```

Large negative space is encouraged.

Do not reduce whitespace simply because the interface appears empty.

---

# 07. Grid

Desktop:

```text
Max width: 1440px
Columns: 12
Gutter: 24px
```

Reading width:

```text
720–840px
```

Allow asymmetric layouts.

Not every element needs to align centrally.

---

# 08. Radius

Use restrained rounding.

```css
--radius-xs: 2px;
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
```

Avoid radii above `12px` except for functional reasons.

Pills are reserved for:

- tags
- filters
- statuses

---

# 09. Borders

Default:

```css
border: 1px solid var(--border-subtle);
```

Borders should often replace:

- shadows
- cards
- background containers

Thin lines are part of the visual language.

Use the three border levels deliberately:

- `border-subtle` for internal rows and low-priority structure.
- `border-default` for cards, controls, and visible containers.
- `border-strong` for page, navigation, and major section boundaries.

Major boundaries may use `2px`; internal structure remains `1px`.

---

# 10. Shadows

Default:

```text
none
```

Use shadows only when actual elevation must be communicated.

Never use glow effects.

---

# 11. Cards

Do not automatically place content inside cards.

Use cards only for independent objects.

Valid examples:

- Candidate
- Project
- Experiment
- Location
- Report

Prefer:

```text
PROJECT / 001

Talent Intelligence

Candidate discovery and analysis
system for specialized researchers.

──────────────────────────────────

STATUS                    ACTIVE
```

over nested floating cards.

---

# 12. Buttons

Standard height:

```text
36–40px
```

Radius:

```text
4–6px
```

Primary actions should be visually clear without becoming oversized.

Avoid:

- gradients
- glow
- excessive rounding
- oversized CTA buttons

---

# 13. Icons

Preferred:

```text
Lucide
```

Rules:

```text
Stroke: 1.5px
Default size: 16–18px
```

Icons should support information.

Do not use icons as decoration.

---

# 14. Navigation

Navigation should occupy minimal visual space.

Prefer:

```text
MINHO LEE                         WORK
                                  LAB
                                  ABOUT
```

or similarly restrained structures.

Active navigation should use typography or a subtle indicator rather than large filled backgrounds.

---

# 15. Interaction Depth

Use progressive disclosure.

### Default

Show the object.

### Hover / Focus

Reveal secondary metadata.

### Click

Reveal detailed structure.

Example:

```text
PROJECT
   ↓
PROJECT + STATUS
   ↓
ARCHITECTURE + DATA + PROCESS
```

Think:

> mechanical watch case → transparent movement

---

# 16. Motion

Standard duration:

```text
120–220ms
```

Preferred properties:

```text
opacity
transform
clip-path
border-color
background-color
```

Movement distance should generally remain under:

```text
8px
```

Avoid springy or playful motion.

---

# 17. Data Visualization

Default visualization should be nearly monochromatic.

Use signal colors to highlight important information.

Preferred:

- line
- bar
- scatter
- timeline
- matrix
- tables

Avoid:

- decorative charts
- unnecessary pie charts
- rainbow palettes
- excessive dashboard widgets

---

# 18. Tables

Tables are first-class UI elements.

Use:

- compact rows
- subtle horizontal separators
- monospace numbers
- aligned numeric columns
- restrained headers

Do not convert structured data into cards solely for appearance.

---

# 19. AI Components

Never visually advertise AI with:

- purple gradients
- sparkle icons
- glowing borders
- robot illustrations

AI should appear as infrastructure.

Expose useful information such as:

```text
MODEL
SOURCE
CONFIDENCE
LAST RUN
STATUS
```

when relevant.

---

# 20. Space Motifs

Allowed:

```text
coordinates
orbital lines
small points
technical numbering
distance
large negative space
thin trajectories
```

Avoid literal:

```text
planets
astronauts
galaxies
spaceships
starfield backgrounds
```

unless the content itself requires them.

---

# 21. Responsive Behavior

```text
Mobile      <640
Tablet      640–1024
Desktop     1024–1440
Wide        >1440
```

Desktop may use dramatic negative space.

Mobile should preserve:

- hierarchy
- precision
- darkness
- typography

Do not simply scale the desktop layout down.

---

# 22. Accessibility

Minimum:

```text
WCAG AA
Keyboard navigation
Visible focus states
Semantic HTML
ARIA where required
Reduced-motion support
```

Design precision includes accessibility.

---

# 23. Forbidden Defaults

Do not introduce the following unless explicitly requested:

```text
Glassmorphism
Neon
Glow
Rainbow gradients
Purple AI gradients
Huge rounded cards
Excessive pills
Heavy shadows
Floating dashboard cards
Decorative illustrations
Large hero CTAs
Emoji-driven UI
Cyberpunk aesthetics
Generic SaaS layouts
```

---

# 24. Component Decision Rule

Before creating a component:

1. Can an existing primitive solve it?
2. Is a container actually necessary?
3. Can spacing establish the hierarchy?
4. Can a border replace the background?
5. Can typography replace decoration?
6. Does the user need this information now?
7. Could deeper information be revealed through interaction?

---

# 25. Implementation Priority

When generating UI, optimize in this order:

```text
1. Information architecture
2. Hierarchy
3. Grid
4. Typography
5. Spacing
6. Interaction
7. Color
8. Decoration
```

Decoration is always last.

---

# 26. Signature Pattern

Where appropriate, interfaces should contain:

```text
PRIMARY OBJECT

        ↓

SECONDARY INFORMATION

        ↓

SYSTEM / MECHANISM
```

The deeper layer may contain:

```text
ID
SOURCE
TIME
MODEL
VERSION
COORDINATE
SCORE
STATUS
```

This creates the signature:

> Quiet exterior. Visible complexity.

---

# 27. Final Instruction for AI Coding Agents

Treat this document as the visual source of truth.

Do not introduce generic SaaS styling.

Do not make the interface friendlier by automatically adding:

- rounded cards
- gradients
- colorful icons
- large buttons
- illustrations

Do not interpret "futuristic" as cyberpunk.

Do not interpret "luxury" as ornamental.

Do not interpret "minimal" as empty.

Instead:

**Structure complexity.**

**Preserve negative space.**

**Reveal mechanisms selectively.**

**Use color as signal.**

**Prefer precision over decoration.**

When uncertain, choose the solution that is:

> quieter, sharper, darker, simpler, and more precise.
