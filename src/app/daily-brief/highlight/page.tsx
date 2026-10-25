import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { HighlightArchive } from "@/components/daily-brief/highlight-archive";
import { getHighlightSummaries } from "@/lib/daily-brief/highlights";

export const metadata = {
  title: "Paper Highlights · Daily Brief",
  description: "A bilingual, blog-style read on one notable Hugging Face paper at a time.",
};

export default function PaperHighlightsPage() {
  return <><Navbar showCvDownload={false} /><LanguageBar /><HighlightArchive highlights={getHighlightSummaries()} /><Footer /></>;
}
