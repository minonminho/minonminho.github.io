import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { VisitorAnalytics } from "@/components/analytics/visitor-analytics";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
  fallback: ["Arial", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minho Lee · Senior HR Professional",
  description:
    "Minho Lee — Senior HR Professional at Samsung Research. Global HR Strategy, AI Transformation, Talent Acquisition.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body id="top" className="min-h-screen flex flex-col bg-background">
        {children}
        <VisitorAnalytics />
      </body>
    </html>
  );
}
