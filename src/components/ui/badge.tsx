import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 focus-visible:border-signal-ice focus-visible:ring-2 focus-visible:ring-signal-ice/30 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-signal-ice text-void [a]:hover:bg-signal-ice/80",
        secondary:
          "bg-surface-03 text-text-secondary [a]:hover:bg-graphite",
        destructive:
          "border-signal-dust/40 bg-signal-dust/10 text-signal-dust [a]:hover:bg-signal-dust/15",
        outline:
          "border-border-default text-text-secondary [a]:hover:bg-surface-02 [a]:hover:text-text-primary",
        ghost:
          "hover:bg-surface-02 hover:text-text-primary",
        link: "text-signal-ice underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
