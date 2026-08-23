import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline-soft bg-canvas px-6 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl justify-end">
        <a
          href="#top"
          aria-label="Back to top"
          className="inline-flex size-11 items-center justify-center rounded-full bg-surface-soft text-ink transition-colors hover:bg-hairline"
        >
          <ArrowUp className="size-4" />
        </a>
      </div>
    </footer>
  );
}
