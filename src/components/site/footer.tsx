import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-background py-8">
      <div className="site-shell flex flex-wrap items-center justify-between gap-6">
        <p className="text-caption">MINHO LEE</p>
        <a
          href="#top"
          aria-label="Back to top"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border-default text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-signal-ice focus-visible:border-signal-ice focus-visible:outline-none"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
