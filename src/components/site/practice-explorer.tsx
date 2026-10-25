"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe, Users, Workflow } from "lucide-react";

const practices = [
  {
    id: "hr",
    label: "Global HR",
    icon: Globe,
    title: "People across borders.",
    description: "Connecting global HR strategy with local operations, from workforce planning to cross-border integration.",
    steps: ["Strategy", "Local context", "Operations"],
    evidence: "Global HR planning across 15+ overseas research subsidiaries.",
    href: "#experience",
    link: "Explore work history",
  },
  {
    id: "talent",
    label: "Talent",
    icon: Users,
    title: "Find the right signals.",
    description: "Bringing research, professional signals, and HR judgment together to understand specialized engineering talent.",
    steps: ["Research", "Signals", "Human judgment"],
    evidence: "AI talent mapping, leadership intelligence, and researcher sourcing.",
    href: "#projects",
    link: "Explore talent projects",
  },
  {
    id: "ai",
    label: "Applied AI",
    icon: Workflow,
    title: "Make systems work better.",
    description: "Turning recurring HR work into practical, evidence-based workflows with agents, automation, and human review.",
    steps: ["Workflow", "Automation", "Human review"],
    evidence: "HR audit agents, workforce systems, and an ongoing exploration of AI at work.",
    href: "/side-projects/",
    link: "Explore side projects",
  },
] as const;

export function PracticeExplorer() {
  const [selected, setSelected] = useState<(typeof practices)[number]["id"]>("hr");
  const practice = practices.find((item) => item.id === selected)!;

  return (
    <div className="practice-explorer">
      <div className="practice-controls">
        <p className="text-caption mb-3">Choose an area to explore</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Areas of practice">
          {practices.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className="practice-choice" aria-pressed={selected === id} aria-controls="practice-detail" onClick={() => setSelected(id)}>
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div id="practice-detail" className="practice-panel">
        <div className="flex items-center justify-between gap-4">
          <p className="panel-caption">Practice / {practice.label}</p>
          <span className="panel-indicator" aria-hidden="true" />
        </div>
        <div aria-live="polite" aria-atomic="true" className="practice-copy">
          <h2 className="text-2xl font-medium leading-tight tracking-tight">{practice.title}</h2>
          <p className="mt-3 text-sm leading-7">{practice.description}</p>
        </div>
        <div className="practice-flow" aria-label="Approach">
          {practice.steps.map((step, index) => (
            <div className="contents" key={step}>
              {index > 0 && <ArrowRight className="size-3 shrink-0" aria-hidden="true" />}
              <span>{step}</span>
            </div>
          ))}
        </div>
        <p className="practice-evidence">{practice.evidence}</p>
        <Link href={practice.href} className="practice-link">{practice.link}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
