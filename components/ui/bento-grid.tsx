/**
 * BentoGrid — adapted from Aceternity UI
 * https://ui.aceternity.com/components/bento-grid
 *
 * Two primitives:
 *   - <BentoGrid>      : the responsive 3-column grid wrapper.
 *   - <BentoGridItem>  : a single tile with header media + title + body + icon.
 *
 * Atelier theming notes:
 *   - Background uses our cream `--color-card` instead of pure white.
 *   - Border uses our sand `--color-border` for cohesion.
 *   - Hover lift is preserved (translateY(-2px)) — that's the bento signature.
 */

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[20rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        // Layout
        "group/bento row-span-1 flex flex-col justify-between space-y-4 overflow-hidden p-4 transition duration-300",
        // Surface (atelier)
        "rounded-xl border bg-[var(--color-card)] border-[var(--color-border)]",
        "shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-12px_rgba(26,22,19,0.08)]",
        // Hover lift
        "hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_24px_48px_-20px_rgba(26,22,19,0.18)]",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon}
        <div
          className="mt-2 mb-2 font-sans font-bold text-[var(--color-foreground)]"
          data-bento-title
        >
          {title}
        </div>
        <div
          className="font-sans text-xs font-normal text-[var(--color-muted-foreground)]"
          data-bento-body
        >
          {description}
        </div>
      </div>
    </div>
  );
}
