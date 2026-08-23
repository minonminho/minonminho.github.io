import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// DESIGN-figma.md 폰트 대체: figmaSans → Geist, figmaMono → Geist Mono
// Geist는 가변 폰트라 320/340/480/540 같은 세밀한 웨이트를 그대로 쓸 수 있다.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body id="top" className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
