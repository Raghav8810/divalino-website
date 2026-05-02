"use client";

/**
 * GalleryProgress
 * ----------------------------------------------------------------------------
 * Bottom-of-viewport indicator showing:
 *   - "03 / 12" card counter (1-indexed)
 *   - Thin progress bar that fills left-to-right with scroll
 *
 * Performance design:
 *   - The parent gallery passes refs for the bar fill + counter span and
 *     writes to them directly on every scroll tick — no React re-renders.
 *   - Bar uses `transform: scaleX()` (GPU-composited; cheap to repaint).
 */

type Props = {
  total: number;
  barRef: React.Ref<HTMLDivElement>;
  counterRef: React.Ref<HTMLSpanElement>;
};

export function GalleryProgress({ total, barRef, counterRef }: Props) {
  const totalDisplay = String(total).padStart(2, "0");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 mt-8 z-20 flex items-center gap-6 px-8 text-[var(--color-foreground)]">
      <div className="font-mono text-xs tracking-[0.3em] text-[var(--color-foreground)]">
        {/* Counter starts at "01" — parent overwrites textContent imperatively. */}
        <span ref={counterRef}>01</span>{" "}
        <span className="text-[var(--color-muted-foreground)]">/ {totalDisplay}</span>
      </div>
      <div className="h-px flex-1 bg-[var(--color-border)]">
        <div
          ref={barRef}
          className="h-full origin-left bg-[var(--color-brand-500)] will-change-transform [backface-visibility:hidden]"
          style={{
            transform: "scaleX(0)",
            transformOrigin: "left center",
          }}
        />
      </div>
    </div>
  );
}
