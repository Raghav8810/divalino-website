"use client";

/**
 * ExploreSection — "Layered pinning chapters" (finite)
 * ----------------------------------------------------------------------------
 * Adapted from the GSAP layered-pin demo, but with the infinite wrap
 * intentionally REMOVED so the page can flow into a normal next section
 * (blog grid, footer, etc.) after the last chapter.
 *
 * BEHAVIOUR
 * ---------
 *  1. Panels stack vertically. Each one pins on top of the previous (the
 *     `pinSpacing: false` trick). As you scroll, the next panel slides up
 *     and "covers" the previous one — layered pinning.
 *  2. The LAST panel uses `pinSpacing: true` and ends after one extra
 *     viewport of scroll, releasing the page back into normal flow.
 *  3. Per-panel text reveal: eyebrow / heading-words / body cascade in
 *     once the panel enters the viewport.
 *
 * Reduced motion: degrades to a static stacked list (no pin, no reveal).
 */

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import type { ExplorePanel } from "@/lib/explore/mock";

type Props = {
  panels: ExplorePanel[];
};

export function ExploreSection({ panels }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Collect existing panels.
      const panelEls = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".explore-panel"),
      );
      if (panelEls.length === 0) return;

      // No clone, no wrap — the user wants a finite stack that releases the
      // page back to normal flow after the last chapter (so the blog/footer
      // can mount underneath). The infinite-loop variant is intentionally
      // disabled here.
      const allPanels = panelEls;

      // Layered pin — each panel pins at the top with `pinSpacing: false`
      // so the next panel scrolls up over it instead of pushing it down.
      // EXCEPTION: the final panel uses `pinSpacing: true` and ends after
      // one viewport of additional scroll, which gives us a clean handoff
      // back into normal page flow (so the next section — blog/footer —
      // mounts underneath without overlap).
      allPanels.forEach((panel, i) => {
        const isLast = i === allPanels.length - 1;
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          end: isLast ? "+=100%" : undefined,
          pin: true,
          pinSpacing: isLast,
        });

        const eyebrow = panel.querySelector<HTMLElement>("[data-explore-eyebrow]");
        const heading = panel.querySelector<HTMLElement>("[data-explore-heading]");
        const body = panel.querySelector<HTMLElement>("[data-explore-body]");
        const headingWords = panel.querySelectorAll<HTMLElement>(
          "[data-explore-word]",
        );
        if (!eyebrow || !heading || !body) return;

        // Hide everything initially — the reveal animation will bring it in.
        // Big, dramatic starting positions so the reveal is unmistakable.
        gsap.set(eyebrow, { y: 60, opacity: 0 });
        gsap.set(headingWords, { yPercent: 130, opacity: 0, rotate: 4 });
        gsap.set(body, { y: 80, opacity: 0 });

        // ENTRY — fires ONCE when the panel scrolls into view (not scrubbed).
        // Long, cinematic durations so the motion reads clearly even on a
        // fast scroll wheel.
        const entry = gsap
          .timeline({ paused: true, defaults: { ease: "expo.out" } })
          .to(
            eyebrow,
            { y: 0, opacity: 1, duration: 1.0 },
            0,
          )
          .to(
            headingWords,
            {
              yPercent: 0,
              opacity: 1,
              rotate: 0,
              duration: 1.6,
              stagger: 0.12,
            },
            0.25,
          )
          .to(
            body,
            { y: 0, opacity: 1, duration: 1.2 },
            0.9,
          );

        ScrollTrigger.create({
          trigger: panel,
          // Fire when the panel has scrolled at least 15% into view. For the
          // first panel this is right when the gallery exits; for later
          // panels it fires the moment they start covering the previous one.
          start: "top 85%",
          onEnter: () => entry.play(),
          // When the user scrolls back UP past this point, reset so the
          // animation plays fresh next time (only really matters for the
          // first panel since later ones are pinned-stacked).
          onLeaveBack: () => entry.progress(0).pause(),
        });
      });

      // (Snap + infinite wrap removed: section is now finite and releases
      // back into normal page flow after the last panel.)
    }, section);

    return () => {
      ctx.revert();
    };
  }, [panels.length]);

  return (
    <section
      ref={sectionRef}
      id="explore"
      data-navbar-theme="dark"
      className="relative bg-[#0e100f] text-[#fffce1]"
      style={{ fontFamily: "var(--font-satoshi)" }}
      aria-label="Explore"
    >
      {panels.map((panel, i) => (
        <Panel key={panel.id} panel={panel} index={i} total={panels.length} />
      ))}
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Panel — single full-viewport "chapter".
 * -------------------------------------------------------------------------- */
function Panel({
  panel,
  index,
  total,
}: {
  panel: ExplorePanel;
  index: number;
  total: number;
}) {
  return (
    <article
      className="explore-panel relative h-screen w-full overflow-hidden"
    >
      <Image
        src={panel.image}
        alt={panel.heading}
        fill
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        sizes="100vw"
        className="object-cover"
      />

      {/* Bottom-weighted scrim for legibility. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(14,16,15,0.92) 0%, rgba(14,16,15,0.55) 35%, rgba(14,16,15,0) 70%)",
        }}
      />

      {/* Top-right index counter — editorial signature touch. */}
      <div className="absolute right-8 top-10 z-10 font-mono text-[0.7rem] tracking-[0.3em] text-[#fffce1]/70 md:right-16 md:top-12">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      {/* Caption block — bottom-left. */}
      <div className="absolute inset-x-8 bottom-16 z-10 max-w-3xl text-[#fffce1] md:inset-x-16 md:bottom-24">
        <p
          data-explore-eyebrow
          className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-[#fffce1]/75 will-change-transform"
          style={{ fontWeight: 500 }}
        >
          {panel.eyebrow}
        </p>
        <h2
          data-explore-heading
          className="text-4xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          style={{ fontWeight: 700 }}
        >
          {/* Each word lives inside an overflow-hidden mask. The inner span
              is what GSAP animates (yPercent 110 → 0), so the visual reads
              as the word being lifted from beneath a shelf. */}
          {panel.heading.split(" ").map((word, idx) => (
            <span
              key={idx}
              className="inline-block overflow-hidden align-bottom"
              style={{
                marginRight: "0.25em",
                paddingBottom: "0.08em",
              }}
            >
              <span
                data-explore-word
                className="inline-block will-change-transform"
              >
                {word}
              </span>
            </span>
          ))}
        </h2>
        <p
          data-explore-body
          className="mt-6 max-w-xl text-base leading-relaxed text-[#fffce1]/85 md:text-lg will-change-transform"
          style={{ fontWeight: 400 }}
        >
          {panel.body}
        </p>
      </div>
    </article>
  );
}
