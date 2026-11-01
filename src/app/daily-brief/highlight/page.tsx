import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { HighlightArchive } from "@/components/daily-brief/highlight-archive";
import { getHighlightSummaries } from "@/lib/daily-brief/highlights";
import { getPaperReviewSummaries } from "@/lib/daily-brief/paper-reviews";

export const metadata = {
  title: "Highlighted Paper Reviews · Daily Brief",
  description: "Highlighted research reviews, with historical preliminary highlights kept separate.",
};

export default function PaperHighlightsPage() {
  return <><Navbar showCvDownload={false} /><LanguageBar /><HighlightArchive reviews={getPaperReviewSummaries().filter((review) => review.reviewFormat === "highlighted")} highlights={getHighlightSummaries()} /><Footer /></>;
}
