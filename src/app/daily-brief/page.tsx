import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ResearchBar } from "@/components/research/language";
import { ResearchHome } from "@/components/research/home";
import { getResearchReviews } from "@/lib/research/content";
export const metadata: Metadata = { title: "Daily Brief · One AI Paper a Day", description: "One consequential AI paper, carefully explained, with contextual AI learning support." };
export default function DailyBriefPage() {
  return <><Navbar showCvDownload={false} /><ResearchBar /><ResearchHome reviews={getResearchReviews()} /><Footer /></>;
}
