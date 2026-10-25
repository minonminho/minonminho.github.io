import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { BriefHome } from "@/components/daily-brief/home";
import { LanguageBar } from "@/components/daily-brief/language";
import { getBriefs, getBriefSummaries } from "@/lib/daily-brief/content";
import { getHighlightSummaries } from "@/lib/daily-brief/highlights";

export const metadata = {
  title: "Daily Brief · Minho Lee",
  description: "엔지니어 관점의 AI 트렌드: 모델, 개발 도구, 추론 기술과 실험을 한국어와 영어로 읽어보세요.",
};

export default function DailyBriefPage() {
  return <><Navbar showCvDownload={false} /><LanguageBar /><BriefHome latest={getBriefs()[0]} issues={getBriefSummaries()} spotlight={getHighlightSummaries()[0]} /><Footer /></>;
}
