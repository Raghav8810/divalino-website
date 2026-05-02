"use client";

/**
 * JournalGrid — fabric & craft blog section, presented as an Aceternity-style
 * bento grid.
 *
 * Animation
 * ---------
 * On scroll-into-view we run the same cinematic reveal we use elsewhere:
 *   - Section heading: word-by-word clip-mask lift.
 *   - Each tile: fades + slides up with a stagger so the grid "writes itself".
 * Both tied to a single ScrollTrigger (`onEnter` once, with `onLeaveBack`
 * reset so it replays if the user scrolls back up).
 *
 * Implementation notes
 * --------------------
 *  - The bento primitives (`BentoGrid`, `BentoGridItem`) live in `components/ui`
 *    so the markup stays close to the canonical Aceternity API.
 *  - Tile headers are full-bleed Unsplash photos with a soft inner ring.
 *  - The grid is 1-col on mobile, 3-col on md+. Two tiles span 2 cols
 *    (matches Aceternity demo: indices 3 and 6).
 */

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import {
  Anchor,
  BookOpen,
  Compass,
  Feather,
  Layers,
  Scissors,
  Sparkles,
} from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils/cn";
import type { JournalEntry } from "@/lib/journal/mock";

type Props = {
  entries: JournalEntry[];
  eyebrow?: string;
  heading?: string;
  intro?: string;
};

const ICONS = [Scissors, Feather, Layers, Sparkles, BookOpen, Anchor, Compass];

export function JournalGrid({
  entries,
  eyebrow = "The Journal",
  heading = "Notes on fabric, craft, and the atelier.",
  intro = "Short reads from the workroom — the cloth we travel for, the people who make it, and the small details we obsess over so the garment lasts.",
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const headingWords = section.querySelectorAll<HTMLElement>(
        "[data-journal-word]",
      );
      const eyebrowEl = section.querySelector<HTMLElement>(
        "[data-journal-eyebrow]",
      );
      const introEl = section.querySelector<HTMLElement>(
        "[data-journal-intro]",
      );
      const tiles = section.querySelectorAll<HTMLElement>(
        "[data-journal-tile]",
      );

      // Initial states — match the Explore section's reveal scale so the
      // two sections feel like one motion language.
      gsap.set(eyebrowEl, { y: 30, opacity: 0 });
      gsap.set(headingWords, { yPercent: 130, opacity: 0, rotate: 4 });
      gsap.set(introEl, { y: 40, opacity: 0 });
      gsap.set(tiles, { y: 60, opacity: 0 });

      const entry = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(eyebrowEl, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .to(
          headingWords,
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.4,
            stagger: 0.08,
          },
          0.15,
        )
        .to(introEl, { y: 0, opacity: 1, duration: 1.0 }, 0.55)
        .to(
          tiles,
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.7,
        );

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => entry.play(),
        onLeaveBack: () => entry.progress(0).pause(),
      });
    }, section);

    return () => ctx.revert();
  }, [entries.length]);

  return (
    <section
      ref={sectionRef}
      id="journal"
      data-navbar-theme="light"
      className="relative bg-[var(--color-background)] pt-24 pb-8 md:pt-32 md:pb-5"
      style={{ fontFamily: "var(--font-satoshi)" }}
      aria-label="Journal"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header — centered, editorial */}
        <header className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <p
            data-journal-eyebrow
            className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted-foreground)] will-change-transform"
            style={{ fontWeight: 500 }}
          >
            {eyebrow}
          </p>
          <h2
            className="text-3xl leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-5xl lg:text-6xl"
            style={{ fontWeight: 700 }}
          >
            {heading.split(" ").map((word, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden align-bottom"
                style={{ marginRight: "0.25em", paddingBottom: "0.08em" }}
              >
                <span
                  data-journal-word
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
          <p
            data-journal-intro
            className="mt-6 text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg will-change-transform"
            style={{ fontWeight: 400 }}
          >
            {intro}
          </p>
        </header>

        {/* Grid */}
        <BentoGrid>
          {entries.map((entry, i) => {
            const Icon = ICONS[i % ICONS.length];
            // Indices 3 and 6 span two columns (Aceternity demo pattern).
            const wide = i === 3 || i === 6;
            return (
              <div
                key={entry.id}
                data-journal-tile
                className={cn(
                  "will-change-transform",
                  wide ? "md:col-span-2" : "",
                )}
              >
                <BentoGridItem
                  title={entry.title}
                  description={entry.description}
                  header={<TileHeader image={entry.image} alt={entry.title} />}
                  icon={
                    <Icon
                      className="h-4 w-4 text-[var(--color-brand-500)]"
                      strokeWidth={1.5}
                    />
                  }
                  className="h-full"
                />
              </div>
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Tile header — full-bleed image with subtle warm scrim and slow zoom on hover.
 * -------------------------------------------------------------------------- */
function TileHeader({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="group/tile relative flex h-full min-h-[10rem] w-full flex-1 overflow-hidden rounded-lg bg-[var(--color-muted)]">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/bento:scale-[1.06]"
      />
      {/* Warm scrim — keeps the cream-on-photo feel coherent across tiles. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,22,19,0) 55%, rgba(26,22,19,0.18) 100%)",
        }}
      />
    </div>
  );
}
