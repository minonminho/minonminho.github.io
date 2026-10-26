import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { HighlightReader } from "@/components/daily-brief/highlight-reader";
import { getHighlight, getHighlights } from "@/lib/daily-brief/highlights";

export const dynamicParams = false;

export function generateStaticParams() {
  return getHighlights().map((highlight) => ({ date: highlight.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const highlight = getHighlight((await params).date);
  if (!highlight) return {};
  return { title: `${highlight.title.en} · Paper Highlight`, description: highlight.dek.en };
}

export default async function PaperHighlightPage({ params }: { params: Promise<{ date: string }> }) {
  const highlight = getHighlight((await params).date);
  if (!highlight) notFound();
  return <><Navbar showCvDownload={false} /><LanguageBar /><main className="flex-1"><HighlightReader highlight={highlight} /></main><Footer /></>;
}
