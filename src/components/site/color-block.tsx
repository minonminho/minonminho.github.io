import type { ReactNode } from "react";

// DESIGN-figma.md 시그니처 컬러 블록 섹션
// - 데스크톱(md↑): 콘텐츠 폭 전체를 덮는 rounded-[24px]({rounded.lg}) 패널 + 48px({spacing.xxl}) 안쪽 여백
// - 모바일(768px 미만): 문서 규약대로 모서리를 없애고 뷰포트 끝까지 풀블리드하는 포스터 처리
// 색상은 globals.css @theme 의 {colors.block-*} 토큰(bg-lime 등)만 사용한다.

const TONE_CLASS = {
  lime: "bg-lime",
  cream: "bg-cream",
  navy: "bg-navy text-inverse-ink",
} as const;

type ColorBlockProps = {
  tone: keyof typeof TONE_CLASS;
  children: ReactNode;
};

export function ColorBlock({ tone, children }: ColorBlockProps) {
  return (
    <div className={`${TONE_CLASS[tone]} px-6 py-12 md:rounded-[24px] md:p-12`}>
      {children}
    </div>
  );
}
