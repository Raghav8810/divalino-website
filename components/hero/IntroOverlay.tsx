"use client";

/**
 * IntroOverlay
 * ----------------------------------------------------------------------------
 * Premium "landing" animation shown on first page load.
 *
 * Sequence (all GSAP-driven, ~2.8s total):
 *   0.0s  Brand mark fades up + letter-spacing relaxes (feels like the logo
 *         "settles in")
 *   1.2s  A thin horizontal line grows from 0 to full width beneath the logo
 *   1.6s  Logo + line fade out together
 *   1.8s  The overlay splits into a TOP half and BOTTOM half; both slide away
 *         on the Y axis (top goes up, bottom goes down) with an ease-out curve
 *         — gives a theatrical "curtain from the middle" reveal of the hero
 *   2.8s  onDone() fires → parent re-enables scroll and starts Lenis/GSAP
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

export function IntroOverlay({ onDone, brand = "LEARNING WEB" }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const logo = logoRef.current;
    const line = lineRef.current;
    if (!root || !top || !bottom || !logo || !line) return;

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

    const tl = gsap.timeline({
      onComplete: () => {
        // Restore scroll before handing off to the hero.
        document.body.style.overflow = prevOverflow;
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
        onDone();
      },
    });

    // Initial states.
    gsap.set(logo, { autoAlpha: 0, y: 20, letterSpacing: "0.6em" });
    gsap.set(line, { scaleX: 0, transformOrigin: "center" });

    // Scene A — logo settles in.
    tl.to(logo, {
      autoAlpha: 1,
      y: 0,
      letterSpacing: "0.3em",
      duration: 1.0,
      ease: "power3.out",
    })
      // Scene B — accent line grows.
      .to(
        line,
        { scaleX: 1, duration: 0.9, ease: "power2.inOut" },
        0.35,
      )
      // Scene C — logo + line fade.
      .to(
        [logo, line],
        { autoAlpha: 0, duration: 0.4, ease: "power2.in" },
        1.5,
      )
      // Scene D — split reveal: two halves slide apart.
      // Using yPercent with transform-origin at the panel's own edge gives a
      // cinematic "shutter" feel. `expo.inOut` makes it feel heavy and
      // deliberate, not flippant.
      .to(
        top,
        { yPercent: -100, duration: 1.1, ease: "expo.inOut" },
        1.7,
      )
      .to(
        bottom,
        { yPercent: 100, duration: 1.1, ease: "expo.inOut" },
        1.7,
      )
      // Finally hide the root so it can't catch pointer events.
      .set(root, { autoAlpha: 0, pointerEvents: "none" });

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
      className="fixed inset-0 z-[100] pointer-events-none"
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
        Brand + accent line are rendered on a fixed overlay at the SAME z-index
        as the halves but higher stacking order so they float in the middle.
        Sitting outside the two halves means the split doesn't clip the logo.
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          ref={logoRef}
          className="font-display text-[0.75rem] md:text-sm uppercase text-white/95 will-change-[transform,opacity,letter-spacing]"
          style={{ letterSpacing: "0.3em" }}
        >
          {brand}
        </div>
        <div
          ref={lineRef}
          className="mt-5 h-px w-24 bg-white/60 will-change-transform"
        />
      </div>
    </div>
  );
}
