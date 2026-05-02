"use client";

/**
 * FaqSection — editorial Q&A with awwwards-style accordion behaviour.
 *
 * Design choices
 * --------------
 *  - Hairline-ruled rows (no boxed cards) so the section reads like a
 *    magazine page rather than a support widget.
 *  - Each row has a small mono row-number on the left ("01" → "06"),
 *    paired with a thin antique-gold rule on hover/open.
 *  - The expand/collapse icon morphs from + to − via a 90° rotation on
 *    one of the strokes — single-line affordance, very premium.
 *  - Height transition uses the `grid-template-rows: 0fr → 1fr` trick:
 *    pure CSS, no JS height measurement, and works correctly when the
 *    answer text wraps responsively.
 *  - Only one item open at a time (accordion) — keeps the page calm.
 *
 * Animation
 * ---------
 *  - Section eyebrow + heading reveal on enter (word-by-word clip-mask
 *    lift, matching every other section's pattern).
 *  - Each row fades up into place with a stagger as the section enters
 *    the viewport.
 *  - Row open/close uses a 500ms cubic-bezier transition — heavy front,
 *    gentle settle, never instant.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";
import type { FaqItem } from "@/lib/faq/mock";

type Props = {
  items: FaqItem[];
  eyebrow?: string;
  heading?: string;
  className?: string;
};

export function FaqSection({
  items,
  eyebrow = "have any query in mind?",
  heading = "Frequently Asked Questions",
  className,
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const eyebrowEl = section.querySelector<HTMLElement>("[data-faq-eyebrow]");
      const words = section.querySelectorAll<HTMLElement>("[data-faq-word]");
      const rows = section.querySelectorAll<HTMLElement>("[data-faq-row]");
      const cta = section.querySelector<HTMLElement>("[data-faq-cta]");

      gsap.set(eyebrowEl, { y: 28, opacity: 0 });
      gsap.set(words, { yPercent: 130, opacity: 0, rotate: 4 });
      gsap.set(rows, { y: 36, opacity: 0 });
      gsap.set(cta, { y: 24, opacity: 0 });

      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(eyebrowEl, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.4,
            stagger: 0.08,
          },
          0.15,
        )
        .to(
          rows,
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.07,
            ease: "power3.out",
          },
          0.55,
        )
        .to(cta, { y: 0, opacity: 1, duration: 0.9 }, 0.95);

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
      data-navbar-theme="light"
      className={cn(
        "relative bg-[var(--color-background)] pt-24 pb-12 md:pt-32 md:pb-16",
        className,
      )}
      style={{ fontFamily: "var(--font-satoshi)" }}
      aria-label="Frequently asked questions"
    >
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        {/* ---------- Header ---------- */}
        <header className="mb-14 text-center md:mb-20">
          <p
            data-faq-eyebrow
            className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted-foreground)] will-change-transform"
            style={{ fontWeight: 500 }}
          >
            {eyebrow}
          </p>
          <h2
            className="leading-[0.95] text-[var(--color-foreground)]"
            style={{
              fontFamily: "var(--font-humane)",
              fontWeight: 500,
              fontSize: "clamp(3rem, 9vw, 9rem)",
              letterSpacing: "0.005em",
            }}
          >
            {heading.split(" ").map((word, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden align-bottom"
                style={{ marginRight: "0.18em", paddingBottom: "0.06em" }}
              >
                <span
                  data-faq-word
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
        </header>

        {/* ---------- Accordion list ---------- */}
        <div
          className="border-t border-[var(--color-border)]"
          role="list"
        >
          {items.map((item, i) => (
            <FaqRow
              key={item.id}
              item={item}
              index={i}
              open={openId === item.id}
              onToggle={() =>
                setOpenId((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </div>

        {/* ---------- Bottom CTA ---------- */}
        <div
          data-faq-cta
          className="mt-16 flex flex-col items-center gap-4 text-center will-change-transform md:mt-24"
        >
          <p
            className="text-[0.72rem] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]"
            style={{ fontWeight: 500 }}
          >
            Still have questions?
          </p>
          <a
            href="mailto:atelier@learningweb.local"
            className="group inline-flex items-center gap-3 text-base text-[var(--color-foreground)] transition-colors hover:text-[var(--color-brand-500)] md:text-lg"
            style={{ fontWeight: 600 }}
          >
            Write to the atelier directly
            <span
              aria-hidden
              className="block h-px w-10 bg-current transition-[width] duration-300 group-hover:w-16"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * FaqRow — single accordion row with hairline rule + animated +/− icon.
 *
 * The expand/collapse uses CSS Grid's `grid-template-rows: 0fr → 1fr` trick.
 * The inner panel sets `min-height: 0; overflow: hidden;` so the parent
 * grid row clamps it. Transitioning the grid track itself produces a
 * perfectly smooth height animation that respects content reflow on
 * resize — no JS height measurement required.
 * -------------------------------------------------------------------------- */
function FaqRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="listitem"
      data-faq-row
      data-open={open}
      className={cn(
        "group/faq relative border-b border-[var(--color-border)] will-change-transform",
        // Subtle bg shift on hover/open to telegraph interactivity.
        "transition-colors duration-300",
        open ? "bg-[var(--color-card)]/40" : "hover:bg-[var(--color-card)]/25",
      )}
    >
      {/* Antique-gold accent rule that grows on hover — magazine flourish. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-px bg-[var(--color-brand-500)]",
          "transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "w-full" : "w-0 group-hover/faq:w-16",
        )}
      />

      <button
        type="button"
        aria-expanded={open}
        aria-controls={`faq-panel-${item.id}`}
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-6 px-2 py-7 text-left md:px-4 md:py-8",
          "transition-colors duration-300",
        )}
      >
        {/* Row number — mono, antique-gold accent. */}
        <span
          className="pt-1 font-mono text-[0.7rem] tracking-[0.3em] text-[var(--color-brand-500)]"
          style={{ fontWeight: 500 }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question text — grows slightly on open for emphasis. */}
        <span
          className={cn(
            "flex-1 text-lg leading-[1.35] text-[var(--color-foreground)] md:text-2xl",
            "transition-[letter-spacing] duration-300",
            open ? "tracking-[-0.01em]" : "tracking-tight",
          )}
          style={{ fontWeight: 500 }}
        >
          {item.question}
        </span>

        {/* Plus/minus toggle — two strokes, the vertical one rotates 90°
            on open so the + collapses cleanly into a −. Single
            transform-only animation, no layout. */}
        <span
          aria-hidden
          className="relative mt-2 inline-block h-4 w-4 shrink-0"
        >
          {/* Horizontal bar — always present. */}
          <span className="absolute left-0 top-1/2 block h-[1.5px] w-4 -translate-y-1/2 bg-[var(--color-foreground)]" />
          {/* Vertical bar — rotates to flat. */}
          <span
            className={cn(
              "absolute left-1/2 top-0 block h-4 w-[1.5px] -translate-x-1/2 bg-[var(--color-foreground)]",
              "origin-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "rotate-90" : "rotate-0",
            )}
          />
        </span>
      </button>

      {/* Animated answer panel — grid-row trick. */}
      <div
        id={`faq-panel-${item.id}`}
        role="region"
        aria-hidden={!open}
        className={cn(
          "grid px-2 md:px-4",
          "transition-[grid-template-rows,opacity,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "grid-rows-[1fr] pb-8 opacity-100 md:pb-10"
            : "grid-rows-[0fr] pb-0 opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {/* Answer text — indented under the question to mirror its layout. */}
          <p
            className="max-w-3xl pl-[3.5rem] text-base leading-[1.7] text-[var(--color-muted-foreground)] md:pl-[4.25rem] md:text-lg"
            style={{ fontWeight: 400 }}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
