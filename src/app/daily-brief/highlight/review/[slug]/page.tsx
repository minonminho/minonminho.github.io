import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { PaperReviewReader } from "@/components/daily-brief/paper-review-reader";
import { getPaperReview, getPaperReviews } from "@/lib/daily-brief/paper-reviews";
import { getKnowledgeLinksForPaper } from "@/lib/knowledge/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPaperReviews().map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const review = getPaperReview((await params).slug);
  if (!review) return {};
  return { title: `${review.title.ko} · Paper Review`, description: review.dek.ko };
}

export default async function PaperReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const review = getPaperReview((await params).slug);
  if (!review) notFound();
  const knowledgeLinks = getKnowledgeLinksForPaper(review.canonicalId);
  return <><Navbar showCvDownload={false} /><LanguageBar /><main className="flex-1"><PaperReviewReader review={review} knowledgeLinks={knowledgeLinks} apiBaseUrl={process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL ?? ""} /></main><Footer /></>;
}
