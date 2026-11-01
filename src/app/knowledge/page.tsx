import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ResearchBar } from "@/components/research/language";
import { ResearchKnowledge } from "@/components/research/knowledge-library";
import { getResearchConcepts } from "@/lib/research/content";
export const metadata: Metadata = { title: "Knowledge · Learn AI Research Concepts", description: "Understand AI terminology through the papers that use it." };
export default function KnowledgePage() {
  return <><Navbar showCvDownload={false} /><ResearchBar /><ResearchKnowledge concepts={getResearchConcepts()} /><Footer /></>;
}
