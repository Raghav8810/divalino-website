"use client";

/**
 * OurStory — editorial "about" section.
 *
 * Layout (alternating, magazine-style):
 *   1. Big "OUR STORY" headline (Humane, top)
 *   2. Image LEFT  / Paragraph RIGHT
 *   3. Full-width quote / paragraph
 *   4. Image RIGHT / Paragraph LEFT
 *
 * Animation
 * ---------
 * Each paragraph's body copy is split into VISUAL lines (DOM measurement —
 * see `lib/motion/splitLines`) and each line is lifted from beneath a
 * clip-mask via `yPercent: 100 → 0`. The reveal is scrubbed to a
 * ScrollTrigger spanning the paragraph's "top 80% → top 30%" window, so
 * lines settle into place naturally as the user scrolls past.
 *
 * Re-splits on resize so wraps stay correct on every breakpoint
 * (mirrors GSAP's `SplitText autoSplit` behaviour, just hand-rolled).
 */

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { splitLines, type SplitLinesResult } from "@/lib/motion/splitLines";
import { InlineImagePill } from "./InlineImagePill";

const STORY_IMAGE_2 =
  "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=2000&q=80";

/**
 * Inline pill imagery for the manifesto paragraph — small clothing /
 * fabric / atelier crops that punctuate the prose like graphic commas.
 * Sourced from Unsplash; same domain we already whitelist via next.config.
 */
const PILL_FABRIC_DRAPE =
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80"; // silk drape close-up
const PILL_GARMENT_RACK =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80"; // hangers / coats
const PILL_HAND_STITCH =
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"; // hand stitching detail
const PILL_BUTTONS =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80"; // buttons / haberdashery

type Props = {
  eyebrow?: string;
  heading?: string;
  manifesto?: string;
  image?: string;
  pillImages?: string[];
  stats?: Array<{ value: string; label: string }>;
  button?: { label?: string; href?: string };
};

export function OurStory({ eyebrow, heading, manifesto, image, pillImages, stats, button }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  console.log({ 'pillImages': pillImages })

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const splits = new Map<HTMLElement, SplitLinesResult>();
      const triggers: ScrollTrigger[] = [];

      // ---- Heading word reveal (mirrors the rest of the page's pattern) -----
      const headingWords = section.querySelectorAll<HTMLElement>(
        "[data-story-word]",
      );
      const headingEyebrow = section.querySelector<HTMLElement>(
        "[data-story-eyebrow]",
      );
      gsap.set(headingEyebrow, { y: 30, opacity: 0 });
      gsap.set(headingWords, { yPercent: 130, opacity: 0, rotate: 4 });

      const headingTl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(headingEyebrow, { y: 0, opacity: 1, duration: 0.8 }, 0)
        .to(
          headingWords,
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.4,
            stagger: 0.1,
          },
          0.15,
        );

      ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        onEnter: () => headingTl.play(),
        onLeaveBack: () => headingTl.progress(0).pause(),
      });

      // ---- Per-paragraph LINE reveal ---------------------------------------
      const paragraphs = section.querySelectorAll<HTMLElement>("[data-story-body]");

      const buildSplit = (el: HTMLElement) => {
        // Wipe any prior split so we can re-measure cleanly.
        const prev = splits.get(el);
        if (prev) prev.revert();
        const result = splitLines(el);
        splits.set(el, result);

        // Hide each line beneath its mask, then build the entry timeline
        // scrubbed to scroll position. We rebuild the trigger every time so
        // resize-driven re-splits stay tied to fresh DOM nodes.
        gsap.set(result.inners, { yPercent: 100, opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            // Wider scroll window + heavier scrub smoothing = slower, more
            // luxurious reveal. Lines now read across nearly a full viewport
            // of scroll travel.
            start: "top 90%",
            end: "top 15%",
            scrub: 1.4,
          },
        });
        tl.to(result.inners, {
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          stagger: 0.22,
          ease: "expo.out",
        });
        const t = tl.scrollTrigger;
        if (t) triggers.push(t);
      };

      paragraphs.forEach(buildSplit);

      // ---- Inline-image paragraphs: simple word fade-up --------------------
      // The line-splitter rewrites textContent, which destroys inline images.
      // For paragraphs that contain <InlineImagePill> we use a different
      // reveal: split visible *children* (text nodes wrapped in spans + the
      // image pills themselves) and stagger their opacity/y. The pills come
      // along for the ride as siblings, so they stay anchored in the prose.
      const fadeParagraphs = section.querySelectorAll<HTMLElement>(
        "[data-story-fade]",
      );
      fadeParagraphs.forEach((el) => {
        // Wrap each top-level text node in a span so we can animate it.
        // Already-element children (the pills) stay as-is.
        const fragments: HTMLElement[] = [];
        Array.from(el.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent ?? "";
            // Split the text node into per-word spans for a finer stagger.
            const words = text.split(/(\s+)/);
            const replacement = document.createDocumentFragment();
            words.forEach((w) => {
              if (w.trim() === "") {
                replacement.appendChild(document.createTextNode(w));
                return;
              }
              const s = document.createElement("span");
              s.textContent = w;
              s.style.display = "inline-block";
              s.style.willChange = "transform";
              replacement.appendChild(s);
              fragments.push(s);
            });
            node.parentNode?.replaceChild(replacement, node);
          } else if (node instanceof HTMLElement) {
            // The image pill (or any other element child) joins the stagger.
            node.style.willChange = "transform";
            fragments.push(node);
          }
        });

        gsap.set(fragments, { y: 24, opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "top 25%",
            scrub: 1.2,
          },
        });
        tl.to(fragments, {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.025,
          ease: "expo.out",
        });
        const t = tl.scrollTrigger;
        if (t) triggers.push(t);
      });

      // ---- Responsive: re-split + rebuild triggers on resize ----------------
      // Debounced so we don't thrash on every pixel change while resizing.
      let resizeTimer: number | undefined;
      const onResize = () => {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          // Tear down old triggers (the timelines they own are auto-killed).
          triggers.forEach((t) => t.kill());
          triggers.length = 0;
          // Re-split + re-create triggers from the now-restored DOM.
          paragraphs.forEach(buildSplit);
          ScrollTrigger.refresh();
        }, 200);
      };
      window.addEventListener("resize", onResize);

      return () => {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        splits.forEach((s) => s.revert());
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="our-story"
      data-navbar-theme="light"
      className="relative bg-[var(--color-background)] py-24 md:py-32"
      style={{ fontFamily: "var(--font-satoshi)" }}
      aria-label="Our Story"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* ---------- Headline lockup ---------- */}
        <header className="mb-8 text-center md:mb-10">
          <p
            data-story-eyebrow
            className="mb-6 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted-foreground)] will-change-transform"
            style={{ fontWeight: 500 }}
          >
            {eyebrow || "Timdeless design. Thoughtful choices. Made to last."}
          </p>
          <h2
            className="leading-[0.85] tracking-tight text-[var(--color-foreground)]"
            style={{
              fontFamily: "var(--font-humane)",
              fontWeight: 500,
              fontSize: "clamp(4rem, 18vw, 8rem)",
              letterSpacing: "0.005em",
            }}
          >
            {(heading || "OUR STORY ").split(" ").map((word, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden align-bottom"
                style={{ marginRight: "0.18em", paddingBottom: "0.06em" }}
              >
                <span
                  data-story-word
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
        </header>

        {/* ---------- Block 1: Image LEFT, paragraph RIGHT ---------- */}
        {/* <div className="mb-24 grid grid-cols-1 items-center gap-10 md:mb-32 md:grid-cols-12 md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[var(--color-muted)] md:col-span-4">
            <Image
              src={image ?? STORY_IMAGE_1}
              alt="Inside the studio"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="md:col-span-8">
            <p
              data-story-body
              className="text-2xl leading-[1.35] text-[var(--color-foreground)] md:text-3xl lg:text-4xl"
              style={{ fontWeight: 400, letterSpacing: "-0.01em" }}
            >
              Good design doesn&rsquo;t shout. It just feels right. We make
              clothes that become favourites &mdash; pieces you reach for
              without thinking. Classic cuts, quality fabrics, timeless style.
            </p>
          </div>
        </div> */}

        {/* ---------- Block 2: Full-width manifesto with inline image pills.
            Pills are anchored after specific phrases so the imagery
            *reinforces* the words ("quality fabrics", "honest craftsmanship",
            etc.) rather than punctuating them at random. */}
        <div className="mb-24 md:mb-32">
          <p
            data-story-fade
            className="mx-auto max-w-5xl text-center text-2xl leading-[1.55] text-[var(--color-foreground)] md:text-4xl lg:text-5xl"
            style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            {manifesto ? (
              <>
                {"What started as a simple idea "}
                <InlineImagePill
                  src={pillImages?.[0] ?? PILL_FABRIC_DRAPE}
                  alt="Silk drape close-up"
                />
                {" — to make clothes that feel timeless, "}
                <InlineImagePill
                  src={pillImages?.[1] ?? PILL_GARMENT_RACK}
                  alt="Garments on a rail"
                />
                {" comfortable, and worth keeping — quickly became a quiet "}
                <InlineImagePill
                  src={pillImages?.[2] ?? PILL_HAND_STITCH}
                  alt="Hand-stitching detail"
                />
                {" manifesto. Great fashion shouldn’t shout, "}
                <InlineImagePill
                  src={pillImages?.[3] ?? PILL_BUTTONS}
                  alt="Horn and shell buttons"
                />
                {" it should feel inevitable, honest, and made to last."}
              </>
            ) : (
              "What started as a simple idea — to make clothes that feel timeless, comfortable, and worth keeping — quickly became a quiet manifesto. Great fashion shouldn’t shout, it should feel inevitable, honest, and made to last."
            )}
          </p>
        </div>

        {/* ---------- Block 3: editorial award-style spread ----------------
            Layout (desktop, 12-col):
              left  (col 1–7) : numbered chapter mark, oversized pull quote
                                in Humane, body paragraph, stat tickers
                                (collections / made fairly / years), CTA.
              right (col 8–12): full-bleed portrait image with a thin gold
                                rule above and a year stamp beneath.
            All text fades in line-by-line via the existing splitLines path.
        */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          {/* ---------- LEFT column ---------- */}
          <div className="flex flex-col md:col-span-7">
            {/* Numbered chapter mark — paired with a thin rule for a print
                magazine feel. */}
            <div className="mb-10 flex items-center gap-4 md:mb-14">
              <span
                className="font-mono text-[0.7rem] tracking-[0.32em] text-[var(--color-brand-500)]"
                style={{ fontWeight: 500 }}
              >
                03
              </span>
              <span className="h-px w-12 bg-[var(--color-brand-500)]/60" />
              <span
                className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted-foreground)]"
                style={{ fontWeight: 500 }}
              >
                Our Promise
              </span>
            </div>

            {/* Pull quote — Humane, oversized, with one tinted word. */}
            <h3
              data-story-body
              className="mb-10 leading-[0.95] text-[var(--color-foreground)] md:mb-14"
              style={{
                fontFamily: "var(--font-humane)",
                fontWeight: 500,
                fontSize: "clamp(3rem, 7.5vw, 8rem)",
                letterSpacing: "0.005em",
              }}
            >
              SLOW FASHION IS{" "}
              <span style={{ color: "var(--color-brand-500)" }}>BETTER</span>{" "}
              FASHION.
            </h3>

            {/* Supporting body — kept at a reading size; line reveal animates
                in via the existing splitLines path. */}
            <p
              data-story-body
              className="mb-12 max-w-2xl text-base leading-[1.7] text-[var(--color-muted-foreground)] md:text-lg"
              style={{ fontWeight: 400 }}
            >
              Better for you. Better for the people who make it. Better for
              the planet. Our collections are small and intentional &mdash; we
              don&rsquo;t chase what&rsquo;s popular. We create pieces that
              stand the test of time, from organic cotton to ethically-sourced
              silk, choosing materials that feel good and do good.
            </p>

            {/* Stat tickers */}
            <div className="mb-12 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-border)]">
              {(stats && stats.length > 0 ? stats : [
                { value: "< 300", label: "Pieces / season" },
                { value: "100%", label: "Fairly paid hands" },
                { value: "01", label: "Atelier, one roof" },
              ]).map((stat, i) => (
                <Stat key={i} number={stat.value} label={stat.label} />
              ))}
            </div>

            {/* Quiet CTA — under the stats, doubles as a section close. */}
            <a
              href={button?.href || "#"}
              className="group inline-flex items-center gap-3 self-start text-[0.72rem] uppercase tracking-[0.3em] text-[var(--color-foreground)] transition-colors hover:text-[var(--color-brand-500)]"
              style={{ fontWeight: 600 }}
            >
              {button?.label || "Read the manifesto"}
              <span
                aria-hidden
                className="block h-px w-10 bg-current transition-[width] duration-300 group-hover:w-16"
              />
            </a>
          </div>

          {/* ---------- RIGHT column ---------- */}
          <div className="md:col-span-5">
            {/* Thin antique-gold rule above the image — magazine signature. */}
            <div className="mb-3 flex items-center gap-3 md:mb-4">
              <span className="h-px flex-1 bg-[var(--color-brand-500)]/40" />
              <span
                className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]"
                style={{ fontWeight: 500 }}
              >
                Made — slowly
              </span>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[var(--color-muted)]">
              <Image
                src={image ?? STORY_IMAGE_2}
                alt="Artisan at work"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              {/* Bottom-right year stamp — sits over the image like a press
                  watermark. */}
              <div
                className="absolute bottom-4 right-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/85 md:bottom-6 md:right-6"
                style={{
                  fontWeight: 500,
                  textShadow: "0 1px 4px rgba(0,0,0,0.45)",
                }}
              >
                Est. 2025
              </div>
            </div>

            {/* Caption under the image — completes the editorial frame. */}
            <p
              className="mt-4 text-[0.72rem] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]"
              style={{ fontWeight: 500 }}
            >
              The atelier — Como, Italy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Stat — single ticker block used inside Block 3's editorial spread.
 *
 * The grid wrapper has `gap-px` + a brand-border background, which renders
 * each Stat as a card with hairline dividers between siblings. Numbers are
 * set in Humane for visual rhyme with the pull quote and the marquee.
 * -------------------------------------------------------------------------- */
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-2 bg-[var(--color-background)] px-5 py-6 md:px-6 md:py-8">
      <span
        className="leading-none text-[var(--color-foreground)]"
        style={{
          fontFamily: "var(--font-humane)",
          fontWeight: 500,
          fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
          letterSpacing: "0.005em",
        }}
      >
        {number}
      </span>
      <span
        className="text-[0.65rem] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]"
        style={{ fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}
