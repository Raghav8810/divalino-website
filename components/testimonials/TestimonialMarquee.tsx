"use client";

/**
 * TestimonialMarquee — two-row infinite scroll of pull-quote cards.
 *
 * Pattern (matches the Aceternity/dark-glass reference):
 *  - Row 1 scrolls right → left  (`marquee-scroll`).
 *  - Row 2 scrolls left → right  (`marquee-scroll-reverse`).
 *  - Hovering ANY card pauses the row's animation, giving the user time
 *    to read the quote.
 *
 * Implementation
 * --------------
 *  - Pure CSS keyframe `translate3d(0 → -50%)` on a flex track that renders
 *    each list of items twice end-to-end. Same trick as the brand-values
 *    marquee — composited entirely on the GPU, no JS frame work.
 *  - Hover-pause uses `:has(:hover)` on the row container. Each row owns
 *    its own animation, so pausing one doesn't stop the other.
 *  - Premium dark surface (#0c0d0c) with antique-gold accent quote marks
 *    matches the rest of the site's editorial palette.
 *  - Edge fade masks (left/right) keep the cards "emerging from the void"
 *    instead of cutting hard against the section bg.
 *
 * Reduced motion: animations are disabled — both rows render statically.
 */

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";
import type { Testimonial } from "@/lib/testimonials/mock";

type Props = {
  testimonials: Testimonial[];
  /** Seconds for one full loop. Higher = slower. Default 60s. */
  durationSeconds?: number;
  className?: string;
};

const HEADING_TEXT = "WORDS FROM THE PRESS & OUR CLIENTS.";

export function TestimonialMarquee({
  testimonials,
  durationSeconds = 60,
  className,
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Split into two halves so each row has its own set of cards. We
  // intentionally do this BEFORE the duplicate-for-loop step inside the row
  // so the two rows feel distinct rather than mirror copies.
  const half = Math.ceil(testimonials.length / 2);
  const rowA = testimonials.slice(0, half);
  const rowB = testimonials.slice(half);

  // Heading reveal — same word-by-word clip-mask pattern as the rest of
  // the page (Explore / Journal / Story headings).
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const eyebrow = section.querySelector<HTMLElement>(
        "[data-tm-eyebrow]",
      );
      const words = section.querySelectorAll<HTMLElement>("[data-tm-word]");

      gsap.set(eyebrow, { y: 30, opacity: 0 });
      gsap.set(words, { yPercent: 130, opacity: 0, rotate: 4 });

      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(eyebrow, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.4,
            stagger: 0.07,
          },
          0.15,
        );

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.progress(0).pause(),
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Customer testimonials"
      data-navbar-theme="light"
      className={cn(
        // On-theme cream surface — keeps the section in the atelier world.
        "relative isolate w-full overflow-hidden bg-[var(--color-background)]",
        "py-20 md:py-28",
        className,
      )}
    >
      {/* Section header */}
      <header className="relative z-10 mx-auto mb-14 max-w-7xl px-6 text-center md:mb-20 md:px-10">
        <p
          data-tm-eyebrow
          className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted-foreground)] will-change-transform"
          style={{ fontWeight: 500 }}
        >
          Praise
        </p>
        <h2
          className="leading-[0.9] text-[var(--color-foreground)]"
          style={{
            fontFamily: "var(--font-humane)",
            fontWeight: 500,
            fontSize: "clamp(3rem, 9vw, 9rem)",
            letterSpacing: "0.01em",
          }}
        >
          {HEADING_TEXT.split(" ").map((word, idx) => (
            <span
              key={idx}
              className="inline-block overflow-hidden align-bottom"
              style={{ marginRight: "0.18em", paddingBottom: "0.06em" }}
            >
              <span
                data-tm-word
                className="inline-block will-change-transform"
              >
                {word}
              </span>
            </span>
          ))}
        </h2>
      </header>

      {/* Side fade masks — match the cream section bg so card edges
          dissolve into the page rather than cutting hard. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 md:w-40"
        style={{
          background:
            "linear-gradient(to right, var(--color-background) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 md:w-40"
        style={{
          background:
            "linear-gradient(to left, var(--color-background) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Two rows, opposite directions. */}
      <div className="flex flex-col gap-6 md:gap-8">
        <Row
          items={rowA}
          duration={durationSeconds}
          direction="left"
          ariaLabel="Testimonials row one"
        />
        <Row
          items={rowB}
          duration={durationSeconds}
          direction="right"
          ariaLabel="Testimonials row two"
        />
      </div>

      <style jsx>{`
        @keyframes tm-scroll-left {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes tm-scroll-right {
          from {
            transform: translate3d(-50%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
        /* Pause-on-hover: hovering ANYWHERE inside a row pauses that row's
           track. We attach the rule to the row itself (which is the hover
           target since cards are its descendants) — simpler and more
           bulletproof than :has().
           Each row keeps its own animation, so pausing one doesn't stop
           the other. */
        :global(.tm-row:hover .tm-track) {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.tm-track) {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Row — single horizontal track, looped seamlessly via items × 2.
 * -------------------------------------------------------------------------- */
function Row({
  items,
  duration,
  direction,
  ariaLabel,
}: {
  items: Testimonial[];
  duration: number;
  direction: "left" | "right";
  ariaLabel: string;
}) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className="tm-row relative w-full overflow-hidden"
    >
      <div
        className="tm-track flex w-max items-stretch gap-6 will-change-transform md:gap-8"
        style={{
          animation: `${direction === "left" ? "tm-scroll-left" : "tm-scroll-right"} ${duration}s linear infinite`,
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-stretch gap-6 md:gap-8"
            aria-hidden={copy === 1}
          >
            {items.map((t) => (
              <Card key={`${copy}-${t.id}`} testimonial={t} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Card — glass-on-black testimonial tile with avatar, quote, name + title.
 * -------------------------------------------------------------------------- */
function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      role="listitem"
      className={cn(
        // Sizing — wider + shorter, matching the user's reference. Quote
        // wraps on roughly two lines instead of four.
        "relative shrink-0 overflow-hidden rounded-2xl",
        "w-[28rem] md:w-[36rem]",
        // Surface — deep walnut card on the cream section bg. Warmer than
        // pure black so it stays in the atelier palette while still giving
        // the dark/light contrast the user asked for.
        "bg-[#1f1c19] border border-black/20",
        "px-8 py-6 md:px-10 md:py-7",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_-22px_rgba(26,22,19,0.45)]",
        // Lift on hover — paired with the row pause, gives the impression
        // of the card "stepping forward" out of the line.
        "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1",
      )}
      style={{ fontFamily: "var(--font-satoshi)" }}
    >
      {/* Antique-gold quote mark — small editorial signature top-left. */}
      <div
        aria-hidden
        className="mb-2 leading-none text-[var(--color-brand-400)]"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "2rem",
          fontWeight: 500,
        }}
      >
        &ldquo;
      </div>

      <p
        className="line-clamp-2 text-[0.95rem] leading-[1.55] text-white/90 md:text-base"
        style={{ fontWeight: 500 }}
      >
        {testimonial.quote}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 bg-white/10 flex items-center justify-center">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <span className="text-xs text-white/70 font-medium">
              {testimonial.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div
            className="truncate text-sm text-white"
            style={{ fontWeight: 600 }}
          >
            {testimonial.name}
          </div>
          <div
            className="truncate text-xs text-white/55"
            style={{ fontWeight: 400 }}
          >
            {testimonial.title}
          </div>
        </div>
      </div>
    </article>
  );
}
