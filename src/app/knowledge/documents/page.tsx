import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { DocumentList } from "@/components/knowledge/document-list";
import { getKnowledgeConceptSummaries } from "@/lib/knowledge/registry";

export default function KnowledgeDocumentsPage() {
  const concepts = getKnowledgeConceptSummaries();
  return <><Navbar showCvDownload={false} /><LanguageBar /><main className="site-shell flex-1 pb-20 pt-10 md:pb-28 md:pt-14"><header className="border-b-2 border-border-strong pb-8"><p className="text-eyebrow text-signal-mint">KNOWLEDGE / EXPORTS</p><h1 className="text-display-xl mt-5">Documents<span className="text-signal-ice">.</span></h1><p className="mt-5 max-w-3xl text-subhead">Short, business-friendly Concept One-Pagers are independent from the visual Technical Concept Brief.</p></header><DocumentList concepts={concepts} /></main><Footer /></>;
}
