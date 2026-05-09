"use client";

/**
 * IntroOverlay
 * ----------------------------------------------------------------------------
 * Premium Awwwards-style "landing" animation shown on first page load.
 *
 * Sequence (all GSAP-driven, ~3.6s total):
 *   0.0s  Individual letters stagger-reveal from below with rotation
 *   0.4s  A slim progress bar sweeps left-to-right beneath the logo
 *   1.8s  Counter reaches "100" — letters and bar fade out with upward drift
 *   2.2s  The overlay splits: top half clips up, bottom half clips down
 *         with a heavy expo ease (theatrical curtain reveal)
 *   3.3s  onDone() fires → parent re-enables scroll and starts Lenis/GSAP
 *
 * During the intro, document body gets `overflow:hidden` so users can't scroll
 * past the intro before it finishes. Scroll position is forced to top on mount
 * so refreshes don't start mid-page.
 */

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";

type Props = {
  onDone: () => void;
  brand?: string;
};

export function IntroOverlay({ onDone, brand = "divalino" }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const barTrackRef = useRef<HTMLDivElement | null>(null);
  const barFillRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const logo = logoRef.current;
    const barTrack = barTrackRef.current;
    const barFill = barFillRef.current;
    const counter = counterRef.current;
    if (!root || !top || !bottom || !logo || !barTrack || !barFill || !counter)
      return;

    // Lock scroll + pin to top for the duration of the intro.
    const prevOverflow = document.body.style.overflow;
    const prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    // Respect reduced-motion: just unmount quickly.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(root, { autoAlpha: 0 });
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
      const id = requestAnimationFrame(onDone);
      return () => cancelAnimationFrame(id);
    }

    // Grab individual letter spans for staggered animation.
    const letters = logo.querySelectorAll<HTMLSpanElement>("[data-letter]");

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = prevOverflow;
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
        onDone();
      },
    });

    // ---- Initial states ---------------------------------------------------
    gsap.set(letters, {
      autoAlpha: 0,
      y: 30,
      rotateX: 90,
    });
    gsap.set(barTrack, { autoAlpha: 0 });
    gsap.set(barFill, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(counter, { autoAlpha: 0 });

    // ---- Scene A: Letters stagger-reveal ----------------------------------
    // Each letter rotates up from below — 3D perspective flip, Awwwards style.
    tl.to(letters, {
      autoAlpha: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      stagger: 0.04,
      ease: "power4.out",
    });

    // ---- Scene B: Progress bar + counter ----------------------------------
    // Bar track fades in, then the fill sweeps across.
    tl.to(
      barTrack,
      { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
      0.3,
    );
    tl.to(
      counter,
      { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
      0.3,
    );

    // Progress bar fill sweeps left-to-right.
    tl.to(
      barFill,
      {
        scaleX: 1,
        duration: 1.6,
        ease: "power2.inOut",
      },
      0.4,
    );

    // Counter ticks from 0 to 100 — animated numerically.
    const counterObj = { val: 0 };
    tl.to(
      counterObj,
      {
        val: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = String(Math.round(counterObj.val));
        },
      },
      0.4,
    );

    // ---- Scene C: Everything fades out + drifts up ------------------------
    tl.to(
      [logo, barTrack, counter],
      {
        autoAlpha: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.in",
      },
      2.1,
    );

    // ---- Scene D: Curtain split reveal ------------------------------------
    // Two halves slide apart with a heavy expo ease — cinematic shutter.
    tl.to(
      top,
      { yPercent: -100, duration: 1.0, ease: "expo.inOut" },
      2.4,
    );
    tl.to(
      bottom,
      { yPercent: 100, duration: 1.0, ease: "expo.inOut" },
      2.4,
    );

    // Finally hide root so it can't catch pointer events.
    tl.set(root, { autoAlpha: 0, pointerEvents: "none" });

    return () => {
      tl.kill();
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 z-[10000] pointer-events-none"
    >
      {/* Two halves that slide apart at the end of the intro. */}
      <div
        ref={topRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-black will-change-transform"
      />
      <div
        ref={bottomRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-black will-change-transform"
      />

      {/*
        Brand + progress bar centered on the overlay.
        Sits above both halves so the split doesn't clip the content.
      */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ perspective: "600px" }}
      >
        {/* Letter-by-letter brand text */}
        <div
          ref={logoRef}
          className="flex font-display text-sm md:text-base uppercase text-white/95 will-change-[transform,opacity]"
          style={{ letterSpacing: "0.35em" }}
        >
          {brand.split("").map((char, i) => (
            <span
              key={i}
              data-letter
              className="inline-block will-change-[transform,opacity]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Progress bar track + fill */}
        <div
          ref={barTrackRef}
          className="mt-6 h-[1px] w-40 md:w-48 overflow-hidden bg-white/15"
        >
          <div
            ref={barFillRef}
            className="h-full w-full bg-white/80 will-change-transform"
          />
        </div>

        {/* Numeric counter */}
        <span
          ref={counterRef}
          className="mt-3 font-mono text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.3em] text-white/50 tabular-nums"
        >
          0
        </span>
      </div>
    </div>
  );
}
