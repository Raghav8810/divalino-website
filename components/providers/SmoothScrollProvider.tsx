"use client";

/**
 * SmoothScrollProvider
 * ----------------------------------------------------------------------------
 * Wraps the app with Lenis smooth scrolling and bridges it to GSAP so that
 * ScrollTrigger pins / scrubs stay perfectly in sync.
 *
 * Integration notes (why this file exists, not just `new Lenis()`):
 *   1. Lenis animates scroll via rAF; GSAP has its own ticker. We drive Lenis
 *      from GSAP's ticker so both share one frame loop (prevents jitter).
 *   2. ScrollTrigger listens to native scroll events by default — those still
 *      fire with Lenis, but we call `ScrollTrigger.update()` on every Lenis
 *      `scroll` event anyway, which is the documented best-practice.
 *   3. We respect `prefers-reduced-motion` by bailing out entirely — no Lenis,
 *      just native scrolling. Accessibility first.
 */

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Respect user motion preferences — bail out, let the browser scroll natively.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      // Time-based smoothing — 0.9s is the sweet spot for scrubbed-video
      // heroes: long enough to feel premium, short enough that the seek
      // target never lags far behind the actual cursor position.
      // (1.2s felt luxurious but amplified video stutter.)
      duration: 0.9,
      // Exponential ease-out: heavy front, light tail (Apple-style scroll).
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Expose the Lenis instance globally so any component (e.g. the navbar)
    // can call `lenis.scrollTo(target)` for programmatic smooth scrolling
    // that stays in sync with the same physics as manual scroll.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lenis = lenis;

    // Keep ScrollTrigger in sync on every Lenis scroll tick.
    lenis.on("scroll", ScrollTrigger.update);

    // Crucial: Tell Lenis to recalculate the page height whenever ScrollTrigger
    // recalculates its pinned elements. This prevents the footer from getting
    // cut off if GSAP adds height to the document after Lenis initializes.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    // Drive Lenis from GSAP's ticker so we have one unified frame loop.
    // GSAP ticker fires in seconds; Lenis expects milliseconds.
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    // We're already smoothing; GSAP's default lag-smoothing would fight us.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}
