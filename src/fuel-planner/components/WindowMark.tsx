import { cn } from "@fp/lib/utils";

export function WindowMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block bg-ink", className)} />;
}
