"use client";

/**
 * ScrollHint
 * ----------------------------------------------------------------------------
 * "Scroll to explore →" call-out shown only on first load, before the user
 * has scrolled into the gallery. Self-fades-out after the first scroll event
 * so it never gets in the way.
 */

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ScrollHint() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(true);
    window.addEventListener("scroll", onScroll, {
      passive: true,
      once: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-8 top-1/2 z-20 -translate-y-1/2 transition-all duration-700",
        hidden ? "translate-x-4 opacity-0" : "translate-x-0 opacity-100",
      )}
    >
      <span className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">
        Scroll to explore
        {/* Tiny arrow nudge keeps it feeling alive without being noisy. */}
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="animate-[arrowNudge_1.4s_ease-in-out_infinite]"
        />
      </span>

      {/* Local keyframes — tiny, purpose-built, no Tailwind config edits. */}
      <style>{`
        @keyframes arrowNudge {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
