import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@fp/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-th-burnt-ochre/12 text-th-clay-red",
        secondary: "border-rule bg-paper-edge text-ink",
        destructive: "border-transparent bg-th-clay-red/15 text-th-clay-red",
        success: "border-transparent bg-th-forest-green/15 text-th-forest-green",
        outline: "border-rule text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
