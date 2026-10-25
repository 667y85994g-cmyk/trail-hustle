import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@fp/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display text-[15px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-paper hover:bg-th-burnt-ochre",
        destructive:
          "bg-th-clay-red text-paper hover:bg-th-clay-red/85",
        outline:
          "border border-ink/80 bg-transparent text-ink hover:bg-ink hover:text-paper",
        secondary:
          "bg-paper-edge text-ink hover:bg-rule",
        ghost: "text-ink-mute hover:bg-paper-edge hover:text-ink",
        link: "rounded-none font-body text-ink underline decoration-rule underline-offset-4 hover:decoration-ink",
        /** Ghost ochre — for nav CTAs and brand-surface secondary actions.
         *  Solid ochre (default) is reserved for the primary CTA in hero. */
        nav: "border border-ink/80 bg-transparent text-ink hover:bg-ink hover:text-paper",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-13 px-8 text-[17px]",
        xl: "h-14 px-10 text-[18px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
