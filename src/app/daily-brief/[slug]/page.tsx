import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ResearchBar } from "@/components/research/language";
import { ResearchReader } from "@/components/research/reader";
import { getResearchReview, getResearchReviews } from "@/lib/research/content";

export const dynamicParams = false;
export function generateStaticParams() { return getResearchReviews().map((review) => ({ slug: review.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const review = getResearchReview((await params).slug);
  return review ? { title: review.paper.title + " · Daily Brief", description: review.abstract.en } : {};
}
export default async function ResearchPaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const review = getResearchReview((await params).slug);
  if (!review) notFound();
  return <><Navbar showCvDownload={false} /><ResearchBar /><ResearchReader review={review} /><Footer /></>;
}
