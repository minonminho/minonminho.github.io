"use client";

import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import type { SkillGroup } from "@/lib/data";

export function SkillExplorer({ groups }: { groups: readonly SkillGroup[] }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All skills");
  const filtered = groups
    .filter((group) => category === "All skills" || group.label === category)
    .map((group) => ({ ...group, items: group.items.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase())) }))
    .filter((group) => group.items.length > 0);
  const count = filtered.reduce((total, group) => total + group.items.length, 0);

  return (
    <div className="skill-explorer">
      <div className="skill-toolbar">
        <label htmlFor={searchId} className="text-sm font-medium">Explore the toolkit</label>
        <div className="skill-search">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input id={searchId} type="search" placeholder="Search skills, e.g. Python" value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" aria-label="Clear skill search" onClick={() => setQuery("")}><X className="size-4" aria-hidden="true" /></button>}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter skills by category">
          {["All skills", ...groups.map((group) => group.label)].map((label) => <button type="button" key={label} className="skill-filter" aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
        </div>
      </div>
      <div className="skill-results">
        <p className="mb-5 text-xs text-text-tertiary" role="status">{count} {count === 1 ? "skill" : "skills"}{category !== "All skills" ? ` in ${category}` : " across all areas"}</p>
        <div className="space-y-6">
          {filtered.map((group) => <div key={group.label}><h3 className="mb-3 text-sm font-medium">{group.label}</h3><ul className="flex flex-wrap gap-2">{group.items.map((item) => <li key={item} className="skill-chip">{item}</li>)}</ul></div>)}
          {count === 0 && <div className="py-5"><p className="text-body text-text-secondary">No skills match your search.</p><button type="button" className="editorial-link mt-3 min-h-10 text-sm" onClick={() => { setQuery(""); setCategory("All skills"); }}>Reset filters</button></div>}
        </div>
      </div>
    </div>
  );
}
