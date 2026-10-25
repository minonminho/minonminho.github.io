import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { KnowledgeWorkspaceNav } from "@/components/knowledge/workspace-nav";
import { KnowledgeLibrary } from "@/components/knowledge/knowledge-library";
import { getKnowledgeConceptSummaries, getKnowledgeTermIndex } from "@/lib/knowledge/registry";

export const metadata: Metadata = {
  title: "Knowledge Library · Minho Lee",
  description: "A growing, source-linked library of technical concepts from reviewed research papers.",
};

export default function KnowledgePage() {
  const concepts = getKnowledgeConceptSummaries();
  const terms = getKnowledgeTermIndex();
  return <><Navbar showCvDownload={false} /><LanguageBar /><main className="site-shell flex-1 pb-20 pt-10 md:pb-28 md:pt-14">
    <KnowledgeWorkspaceNav />
    <header className="mt-10 border-b-2 border-border-strong pb-8 md:mt-14">
      <p className="text-eyebrow text-signal-mint">RESEARCH KNOWLEDGE / {String(concepts.length).padStart(2, "0")} CONCEPTS</p>
      <h1 className="text-display-xl mt-5">Knowledge Library<span className="text-signal-ice">.</span></h1>
      <p className="mt-5 max-w-3xl text-subhead">Papers become source-linked concepts, visual explanations, and separate business-friendly documents.</p>
    </header>
    <KnowledgeLibrary concepts={concepts} terms={terms} apiBaseUrl={process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL ?? ""} />
  </main><Footer /></>;
}
