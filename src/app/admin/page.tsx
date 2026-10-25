import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { LanguageBar } from "@/components/daily-brief/language";
import { PostManager } from "@/components/admin/post-manager";

export const metadata: Metadata = {
  title: "Post Management · Daily Brief",
  description: "Manage Daily Brief editions, Highlighted Papers, paper reviews, and Knowledge posts.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <>
    <Navbar showCvDownload={false} />
    <LanguageBar />
    <PostManager />
    <Footer />
  </>;
}
