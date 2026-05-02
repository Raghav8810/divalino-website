"use client";

/**
 * Marquee — infinite horizontal scrolling band.
 *
 * Why pure CSS (no GSAP/JS)?
 * --------------------------
 *  - The whole animation is a single `translate3d(-50%, 0, 0)` on a flex
 *    track, ticked by the browser compositor. No layout, no paint, no
 *    JS frame work — buttery on every device.
 *  - To loop seamlessly we render the items twice and translate the track
 *    by exactly -50%; the second copy slides in as the first slides out.
 *  - `animation-play-state: paused` on hover gives the user a moment to
 *    read a phrase. Pure progressive enhancement, no React state.
 *
 * Premium look:
 *  - Black band, white text, oversized compressed display face (Humane,
 *    falling back to Bebas Neue).
 *  - A small antique-gold dot separator between phrases.
 *  - Soft horizontal fade-out at both edges so words "appear from the
 *    void" instead of cutting hard.
 */

import { cn } from "@/lib/utils/cn";

type Props = {
  items: string[];
  /** Seconds for one full loop. Higher = slower. Default: 40s. */
  durationSeconds?: number;
  className?: string;
};

const DEFAULT_ITEMS = [
  "TIMELESS ELEGANCE",
  "CRAFTED WITH PRECISION",
  "WHERE ART MEETS FABRIC",
  "REDEFINING MODERN COUTURE",
  "SUSTAINABLE LUXURY",
  "HANDCRAFTED PERFECTION",
];

export function Marquee({
  items = DEFAULT_ITEMS,
  durationSeconds = 40,
  className,
}: Props) {
  console.log("Marquee Items:", items);
  return (
    <section
      aria-label="Brand values"
      data-navbar-theme="dark"
      className={cn(
        "relative isolate w-full overflow-hidden bg-black py-5 md:py-10",
        className,
      )}
    >
      {/* Edge fades — pure CSS masks; no JS, no extra nodes that affect layout. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 md:w-40"
        style={{
          background:
            "linear-gradient(to right, #000 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 md:w-40"
        style={{
          background:
            "linear-gradient(to left, #000 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* Top + bottom fades — soften the band's edges into the cream page bg.
          Color matches `--color-background` so the gradient terminates in the
          exact tone of the section above/below. */}

      <div
        className="marquee-track flex w-max items-center gap-12 md:gap-20 will-change-transform"
        style={
          {
            // Custom prop drives the keyframe duration so the same component
            // can run at different speeds without re-declaring keyframes.
            "--marquee-duration": `${durationSeconds}s`,
            animation:
              "marquee-scroll var(--marquee-duration) linear infinite",
            fontFamily: "var(--font-humane)",
            // GPU layer hint so the browser composites the track on its own
            // surface (prevents subpixel jitter on Webkit).
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          } as React.CSSProperties
        }
      >
        {/* Render the list TWICE for the seamless -50% wrap. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-12 md:gap-20"
            aria-hidden={copy === 1}
          >
            {items?.map((text, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-12 md:gap-20">
                <span
                  className="block whitespace-nowrap text-white leading-none"
                  style={{
                    fontWeight: 400,
                    fontSize: "clamp(8rem, 20vw, 24rem)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {text}
                </span>
                <span
                  aria-hidden
                  className="inline-block size-2 rounded-full bg-[var(--color-brand-500)]"
                />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Keyframes + reduced-motion + hover-to-pause, scoped via styled-jsx. */}
      <style jsx>{`
        @keyframes marquee-scroll {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            /* -50% works because we render the items twice end-to-end:
               by the time the first copy has moved fully off-screen, the
               second copy is exactly where the first one started. */
            transform: translate3d(-50%, 0, 0);
          }
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
