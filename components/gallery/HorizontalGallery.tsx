"use client";

/**
 * HorizontalGallery
 * ----------------------------------------------------------------------------
 * Pinned section that converts vertical scroll into horizontal card movement.
 *
 * Performance architecture (post-optimisation):
 *   * No React state in the scroll hot path. The ScrollTrigger `onUpdate`
 *     callback writes directly to:
 *       - track  : (handled by GSAP itself)
 *       - cards  : `data-active` attribute toggle
 *       - bar    : `transform: scaleX()`
 *       - counter: `textContent`
 *     React reconciliation never runs while you scroll.
 *   * All transforms use `translate3d` / `scale3d` to stay on the compositor.
 *   * `gsap.context()` scopes cleanup so unmount kills only this gallery's
 *     ScrollTriggers.
 *
 * Mobile fallback: `useIsMobile()` swaps the pinned gallery for a vertical
 * grid — pin/scrub feels bad on touch screens.
 */

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { Product } from "@/lib/products/types";
import { ProductCard } from "./ProductCard";
import { GalleryProgress } from "./GalleryProgress";
import { ScrollHint } from "./ScrollHint";

type Props = {
  products: Product[];
  eyebrow?: string;
  heading?: string;
};

export function HorizontalGallery({
  products,
  eyebrow = "Collection",
  heading = "Featured Pieces",
}: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <section id="featured-pieces" data-navbar-theme="light" className="px-4 py-20">
        <header className="mb-10 text-center">
          <p
            data-gallery-eyebrow
            className="mb-3 text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)] will-change-transform"
          >
            {eyebrow}
          </p>
          <h2
            className="leading-[0.85] tracking-tight te xt-[var(--color-foreground)]"
            style={{
              fontFamily: "var(--font-humane)",
              fontWeight: 500,
              fontSize: "clamp(4rem, 14vw, 6rem)",
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
                  data-gallery-word
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} eager />
          ))}
        </div>
      </section>
    );
  }

  return <DesktopGallery products={products} eyebrow={eyebrow} heading={heading} />;
}

/* ----------------------------------------------------------------------------
 * Desktop pinned gallery
 * -------------------------------------------------------------------------- */
function DesktopGallery({
  products,
  eyebrow,
  heading,
}: Required<Pick<Props, "eyebrow" | "heading">> & { products: Product[] }) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    const counter = counterRef.current;
    if (!wrapper || !track || !stage || !bar || !counter) return;

    // Direct-DOM handles to every card so we can flip `data-active` without
    // touching React. Querying once is much cheaper than per-tick lookups.
    const cardEls = Array.from(
      track.querySelectorAll<HTMLElement>(".product-card"),
    );

    let lastActiveIndex = -1;
    let lastCounter = "";

    // Smoothed bar value — we lerp the bar's scaleX toward the raw scroll
    // progress every frame for sub-pixel buttery motion. ScrollTrigger
    // updates `targetProgress`; the rAF loop animates `currentProgress`.
    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;

    const tickBar = () => {
      // 0.18 lerp is a sweet spot — smooth but never feels laggy.
      currentProgress += (targetProgress - currentProgress) * 0.18;
      bar.style.transform = `scaleX(${currentProgress})`;
      // Continue the loop only while we haven't fully caught up.
      if (Math.abs(targetProgress - currentProgress) > 0.0005) {
        rafId = requestAnimationFrame(tickBar);
      } else {
        rafId = 0;
      }
    };

    const ctx = gsap.context(() => {
      const header = headerRef.current;
      if (header) {
        const headerEls = Array.from(header.children);
        gsap.fromTo(
          headerEls,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 2,
            stagger: 0.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: wrapper,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const getDistance = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: stage,
          pinSpacing: true,
          // Slightly higher scrub adds a touch of inertia on top of Lenis.
          scrub: 1,
          invalidateOnRefresh: true,
          // Keep refresh affordable — recalc only on real resize.
          fastScrollEnd: true,
          snap: products.length > 1 ? {
            snapTo: 1 / (products.length - 1),
            duration: { min: 0.15, max: 0.4 },
            ease: "power2.inOut",
          } : undefined,
          onUpdate: (self) => {
            const p = self.progress;
            // ----- Bar: target value, animated by rAF lerp loop -----
            targetProgress = p;
            if (!rafId) rafId = requestAnimationFrame(tickBar);

            // ----- Active card: flip data-active only when index changes
            const activeIndex = Math.min(
              cardEls.length - 1,
              Math.round(p * (cardEls.length - 1)),
            );
            if (activeIndex !== lastActiveIndex) {
              if (lastActiveIndex >= 0)
                cardEls[lastActiveIndex]?.setAttribute("data-active", "false");
              cardEls[activeIndex]?.setAttribute("data-active", "true");

              // ----- Eager-load the ±1 neighbours, lazy the rest -------
              cardEls.forEach((el, i) => {
                const img = el.querySelector("img");
                if (!img) return;
                const near = Math.abs(i - activeIndex) <= 1;
                if (near) img.setAttribute("loading", "eager");
              });

              lastActiveIndex = activeIndex;
            }

            // ----- Counter: only write when the visible string changes
            const next = String(activeIndex + 1).padStart(2, "0");
            if (next !== lastCounter) {
              counter.textContent = next;
              lastCounter = next;
            }
          },
        },
      });
    }, wrapper);

    // First card starts active.
    cardEls[0]?.setAttribute("data-active", "true");
    lastActiveIndex = 0;

    // Recompute pin math after images settle (their layout shifts width).
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      if (rafId) cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [products.length]);

  return (
    <section ref={wrapperRef} id="featured-pieces" data-navbar-theme="light" className="relative z-10 bg-[var(--color-background)]">
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]"
      >
        <header ref={headerRef} className="absolute left-8 right-8 top-10 z-20 text-center md:left-16 md:right-16 md:top-12">
          <p className="mb-2 text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)] will-change-[transform,opacity]">
            {eyebrow}
          </p>
          <h2
            className="leading-[0.85] tracking-tight text-[var(--color-foreground)] will-change-[transform,opacity]"
            style={{
              fontFamily: "var(--font-humane)",
              fontWeight: 500,
              fontSize: "clamp(3rem, 8vw, 7rem)",
              letterSpacing: "0.005em",
            }}
          >
            {heading}
          </h2>
        </header>

        {/*
          Track — gap bumped to 3rem per spec for more breathing room.
          The first/last padding (20vw) keeps the start/end card centered
          rather than flush against the viewport edge.
        */}
        <div
          ref={trackRef}
          className="absolute left-0 top-1/2 mt-20 flex -translate-y-1/2 items-stretch gap-0 will-change-transform [backface-visibility:hidden] md:mt-20"
        >
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} eager={i < 3} />
          ))}
        </div>

        <ScrollHint />
        <GalleryProgress
          total={products.length}
          barRef={barRef}
          counterRef={counterRef}
        />
      </div>
    </section>
  );
}
