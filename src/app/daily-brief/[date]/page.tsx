import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { BriefReader } from "@/components/daily-brief/reader";
import { getBrief, getBriefs } from "@/lib/daily-brief/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBriefs().map((brief) => ({ date: brief.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const brief = getBrief((await params).date);
  if (!brief) return {};
  return { title: `${brief.title.ko} · Daily Brief`, description: brief.dek.ko };
}

export default async function BriefPage({ params }: { params: Promise<{ date: string }> }) {
  const brief = getBrief((await params).date);
  if (!brief) notFound();
  const issues = getBriefs();
  const index = issues.findIndex((issue) => issue.date === brief.date);
  return <><Navbar showCvDownload={false} /><LanguageBar /><main className="flex-1"><BriefReader brief={brief} older={issues[index + 1]} newer={issues[index - 1]} /></main><Footer /></>;
}
