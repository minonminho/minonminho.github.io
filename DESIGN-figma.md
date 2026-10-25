# Design references - Silent Precision

The filename is retained for existing links. Earlier Figma marketing tokens and
full-width pastel treatments are superseded by
[Design System v2.1](docs/DESIGN_SYSTEM.md) and the
[design philosophy](docs/DESIGN_PHILOSOPHY.md).

## Current reference sites

Reviewed in a browser on 2026-10-25:

| Reference | Apply | Adapt to this portfolio |
| --- | --- | --- |
| [Japan air alert](https://ttang-air-alert.vividfox6.chatgpt.site/) | Sage canvas, ivory panels, dark functional surface, lime/coral states, linked selections | Practice selection updates the explanation and destination; skills support search and category filtering |
| [Paco Coursey](https://paco.me/) | Whitespace, modest typography, understated links, unboxed groups | A broader title rail and readable content column for a longer CV |
| [Emil Kowalski](https://emilkowal.ski/) | Quiet reading flow, small section titles, simple stacked lists | Retain technical indices and the existing HR, project, and education content |

The implementation is original TypeScript/React with shared semantic CSS tokens.
Reference sites supply a visual direction, not code or reusable brand assets.

## Visible implementation

- One continuous sage canvas with ivory or green-gray panel layers, chosen by system preference.
- A 1120px shell and a title/body grid; inset panel padding keeps prose near 820px.
- Pretendard Variable for both English and Korean, Geist Mono for metadata.
- 1px rules, 16px section labels, 18px entry titles, and 16px / 1.8 prose.
- Lime actions in a dark practice panel, coral active controls, sage insets, and neutral prose.
- A linked practice explorer, skill search/filter controls, and native career/project disclosures.
- Responsive stacking below 1024px; native CV printing remains available.
- Side Project is a separate `/side-projects/` page containing the Daily Brief card.
  Its menu follows Education; the home profile ends with Education.

The rejected hero gradient and alternating full-width section backgrounds are not
part of this revision. Functional panels now have deliberate surface layers. Do not reintroduce the archived Figma
marketing palette or oversized pill CTA defaults.
