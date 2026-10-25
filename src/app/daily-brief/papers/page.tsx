import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { PaperReviewArchive } from "@/components/daily-brief/paper-review-archive";
import { getPaperReviewSummaries } from "@/lib/daily-brief/paper-reviews";

export const metadata = {
  title: "Daily Paper Briefs · Daily Brief",
  description: "Bilingual paper reviews, with foundational seed papers clearly separated from Hugging Face Daily rankings.",
};

export default function DailyPaperBriefsPage() {
  return <><Navbar showCvDownload={false} /><LanguageBar /><PaperReviewArchive reviews={getPaperReviewSummaries()} /><Footer /></>;
}
