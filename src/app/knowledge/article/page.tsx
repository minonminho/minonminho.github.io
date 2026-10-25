import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { KnowledgeArticleReader } from "@/components/knowledge/knowledge-article-reader";
import { getKnowledgeConcept, getKnowledgeConceptSummaries } from "@/lib/knowledge/registry";
import type { KnowledgeConcept } from "@/lib/knowledge/types";

export const metadata: Metadata = {
  title: "Technical Concept Brief · Minho Lee",
  description: "A visual explanation of a technical concept, connected to its source papers.",
};

export default function KnowledgeArticlePage() {
  const concepts = getKnowledgeConceptSummaries()
    .map((summary) => getKnowledgeConcept(summary.slug))
    .filter((concept): concept is KnowledgeConcept => Boolean(concept));
  return <><Navbar showCvDownload={false} /><LanguageBar /><KnowledgeArticleReader concepts={concepts} apiBaseUrl={process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL ?? ""} /><Footer /></>;
}
