import type { Visual } from "@/lib/daily-brief/types";

const descriptions: Record<Visual, string> = {
  verification: "A proposed answer passes through evidence checks before becoming a trusted result.",
  workflow: "A research brief connects a role, the market, and evidence in a repeatable workflow.",
  people: "Several agent outputs converge on a human review point, illustrating a possible bottleneck.",
  models: "Different model capabilities connect to one workflow through a common access layer.",
};

// Original vector diagrams, using the site's signal tokens. These are conceptual,
// not data plots or representations of a provider's measured performance.
export function BriefArtwork({ variant = "verification", compact = false }: { variant?: Visual; compact?: boolean }) {
  return (
    <figure className="overflow-hidden border border-border-subtle bg-surface-01">
      <svg viewBox="0 0 600 340" role="img" aria-label={descriptions[variant]} className="h-auto w-full">
        <g fill="none" stroke="var(--border-subtle)" strokeWidth="1">
          {[80, 160, 240, 320, 400, 480, 560].map((x) => <path key={x} d={`M${x} 32V300`} />)}
          {[60, 120, 180, 240, 300].map((y) => <path key={y} d={`M40 ${y}H560`} />)}
        </g>
        <g fill="var(--text-secondary)" fontFamily="monospace" fontSize="10" letterSpacing="1.5">
          <text x="40" y="28">{variant === "verification" ? "FROM OUTPUT TO EVIDENCE" : variant === "people" ? "THE REVIEW LAYER" : variant === "models" ? "CAPABILITY / ACCESS / WORK" : "REPEATABLE RESEARCH"}</text>
          <text x="40" y="324">CONCEPTUAL DIAGRAM</text>
          <text x="520" y="324">FIG. 01</text>
        </g>
        {variant === "verification" && <>
          <g fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
            <path d="M82 110h108v132H82zM100 135h65m-65 18h50m-50 18h65m-65 18h43" />
            <path d="M190 176h76m70 0h76" />
            <circle cx="300" cy="176" r="34" />
            <path d="M276 176l16 16 31-35" stroke="var(--signal-ice)" strokeWidth="2" />
          </g>
          <g fill="none" stroke="var(--signal-ice)" strokeWidth="1.5">
            <path d="M432 125h78v103h-78zM446 151h49m-49 17h49m-49 17h30" />
            <circle cx="510" cy="228" r="10" fill="var(--surface-01)" />
            <path d="M505 228l4 4 7-8" />
          </g>
          <g fill="var(--text-secondary)" fontSize="12" fontFamily="monospace">
            <text x="94" y="274">PROPOSAL</text><text x="278" y="240">CHECK</text><text x="426" y="274">EVIDENCE</text>
          </g>
        </>}
        {variant === "people" && <>
          <g fill="var(--surface-01)" stroke="var(--text-tertiary)" strokeWidth="1.5">
            {[88, 164, 240].map((y) => <g key={y}><rect x="90" y={y} width="92" height="38" /><path d={`M182 ${y + 19}H270L350 164`} /></g>)}
            <circle cx="390" cy="145" r="22" stroke="var(--signal-orbit)" />
            <path d="M348 222c0-55 84-55 84 0" stroke="var(--signal-orbit)" />
            <path d="M432 180h70m-12-6 12 6-12 6" />
          </g>
          <g fill="var(--text-secondary)" fontSize="12" fontFamily="monospace"><text x="99" y="112">AGENT 01</text><text x="99" y="188">AGENT 02</text><text x="99" y="264">AGENT 03</text><text x="347" y="266">JUDGMENT</text></g>
        </>}
        {variant === "workflow" && <>
          <g fill="var(--surface-01)" stroke="var(--text-tertiary)" strokeWidth="1.5">
            <rect x="70" y="108" width="125" height="65" /><rect x="70" y="203" width="125" height="65" />
            <path d="M195 140h66v44h60m-126 52h66v-52" />
            <rect x="321" y="142" width="190" height="84" stroke="var(--signal-mint)" />
          </g>
          <g fill="var(--text-secondary)" fontSize="12" fontFamily="monospace"><text x="94" y="146">THE ROLE</text><text x="85" y="241">THE MARKET</text><text x="347" y="181">RESEARCH BRIEF</text><text x="353" y="204" fontSize="10">+ SOURCE EVIDENCE</text></g>
        </>}
        {variant === "models" && <>
          <g fill="var(--surface-01)" stroke="var(--text-tertiary)" strokeWidth="1.5">
            {[90, 160, 230].map((y) => <g key={y}><rect x="75" y={y} width="110" height="40" /><path d={`M185 ${y + 20}H240V180h65`} /></g>)}
            <rect x="305" y="145" width="90" height="70" stroke="var(--signal-ice)" /><path d="M395 180h54" /><rect x="449" y="153" width="80" height="54" />
          </g>
          <g fill="var(--text-secondary)" fontSize="11" fontFamily="monospace"><text x="98" y="115">MODEL A</text><text x="98" y="185">MODEL B</text><text x="98" y="255">MODEL C</text><text x="318" y="185">ACCESS</text><text x="462" y="185">WORK</text></g>
        </>}
      </svg>
      {!compact && <figcaption className="border-t border-border-subtle px-5 py-3 text-xs leading-relaxed text-text-secondary">{descriptions[variant]}</figcaption>}
    </figure>
  );
}
