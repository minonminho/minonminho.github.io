import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type EntryDetailsProps = {
  title: string;
  period: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function EntryDetails({ title, period, subtitle, defaultOpen = false, children }: EntryDetailsProps) {
  return (
    <details className="entry-disclosure" open={defaultOpen}>
      <summary>
        <div className="min-w-0">
          <p className="mb-2 text-xs leading-6 text-text-tertiary">{period}</p>
          <h3 className="text-lg font-medium leading-7 tracking-tight">{title}</h3>
          {subtitle && <p className="mt-1 text-sm leading-6 text-text-secondary">{subtitle}</p>}
        </div>
        <span className="entry-affordance">
          <span className="when-closed">Details</span><span className="when-open">Close</span>
          <ChevronDown className="entry-chevron size-4" aria-hidden="true" />
        </span>
      </summary>
      <div className="entry-content">{children}</div>
    </details>
  );
}
