"use client";

/**
 * ScrollHero
 * ----------------------------------------------------------------------------
 * Scroll-driven cinematic hero built with GSAP + ScrollTrigger.
 *
 * Layout trick:
 *   We reserve ~200vh of scrollable space via a wrapper <section>. Inside it we
 *   pin a 100vh "stage" so it stays fixed on screen while the user scrolls
 *   through that 200vh range. All motion is "scrubbed" — tied 1:1 to scroll
 *   position, not to real time.
 *
 * Three scenes on the master timeline (0 → 1 scroll progress):
 *   Scene 1  (0.00 → 0.55) :: walk      — video.currentTime follows progress
 *   Scene 2  (0.50 → 0.80) :: approach  — scale + bg parallax + bg blur
 *   Scene 3  (0.80 → 1.00) :: handoff   — character fades, next section slides up
 *
 * Why we scrub video.currentTime manually instead of piping the video into the
 * timeline: HTMLVideoElement doesn't honor gsap.to() on currentTime reliably
 * across browsers — setting it directly in onUpdate is the robust approach.
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";
import { IntroOverlay } from "./IntroOverlay";

// Mock video fallbacks if Sanity fields are empty
const VIDEO_SRC_MP4 = "/uploads/Dress_walking_animation_202604132210.mp4";
const VIDEO_SRC_WEBM = "/uploads/Dress_walking_animation_202604132210.webm";

// Toggle to `true` locally to see ScrollTrigger markers.
const DEBUG_MARKERS = false;

type Props = {
  /** Optional className for the outer scroll wrapper. */
  className?: string;
  kicker?: string;
  heading?: string;
  videoMp4?: string;
  videoWebm?: string;
};

export function ScrollHero({ className, kicker, heading, videoMp4, videoWebm }: Props) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const titleKickerRef = useRef<HTMLParagraphElement | null>(null);
  const titleHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const scrollHintRef = useRef<HTMLDivElement | null>(null);
  const nextSectionRef = useRef<HTMLDivElement | null>(null);

  // Gate the scroll-driven GSAP setup behind the intro animation. While
  // `introDone` is false we render the <IntroOverlay/> and do nothing else.
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  useLayoutEffect(() => {
    // Wait for the intro curtain to finish before wiring ScrollTrigger —
    // otherwise the pin math runs while the overlay is covering the viewport
    // and scroll lock is still active, which throws off `start/end` calcs.
    if (!introDone) return;

    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const bg = bgRef.current;
    const title = titleRef.current;
    const kicker = titleKickerRef.current;
    const heading = titleHeadingRef.current;
    const scrollHint = scrollHintRef.current;
    const nextSection = nextSectionRef.current;
    if (
      !wrapper ||
      !stage ||
      !video ||
      !bg ||
      !title ||
      !kicker ||
      !heading ||
      !scrollHint ||
      !nextSection
    )
      return;

    // ------------------------------------------------------------------
    // Accessibility: reduced-motion fallback.
    // If the user prefers reduced motion we skip the entire GSAP setup:
    //  - no pin / scrub (which can feel like "stuck scroll")
    //  - no scale or blur
    //  - the video plays once, quietly, as a looping ambient element
    //  - the next section reveals via a simple cross-fade on IntersectionObserver
    // ------------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // Reset any inline styles that the animated path would have set.
      gsap.set(nextSection, { clearProps: "all" });
      nextSection.style.transform = "none";
      nextSection.style.opacity = "1";
      nextSection.style.position = "static";

      // Let the video loop gently on its own — no scroll coupling.
      video.loop = true;
      video.autoplay = true;
      video.play().catch(() => {
        /* autoplay blocked — that's fine, static poster is acceptable */
      });

      // Simple IO-based fade for the next section (no pin).
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            (entry.target as HTMLElement).style.opacity = entry.isIntersecting
              ? "1"
              : "0";
          }
        },
        { threshold: 0.2 },
      );
      io.observe(nextSection);
      return () => io.disconnect();
    }

    // gsap.context scopes all tweens/ScrollTriggers so cleanup kills only ours.
    const ctx = gsap.context(() => {
      // ------------------------------------------------------------------
      // Landing reveal — plays ONCE right after the intro overlay lifts.
      // Premium feel comes from:
      //   * `expo.out` ease (fast burst → long glide)
      //   * Clip-path reveal on the heading (masks up rather than fading)
      //   * Tight stagger between kicker → heading → scroll hint
      // ------------------------------------------------------------------
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .fromTo(
          kicker,
          { autoAlpha: 0, y: 24, letterSpacing: "0.6em" },
          {
            autoAlpha: 1,
            y: 0,
            letterSpacing: "0.3em",
            duration: 1.1,
          },
          0.05,
        )
        .fromTo(
          heading,
          {
            autoAlpha: 0,
            y: 40,
            clipPath: "inset(0 0 100% 0)",
          },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 1.3,
          },
          0.2,
        )
        .fromTo(
          scrollHint,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.8,
        );

      // Subtle long-running "breath" on the bg gradient — adds life during
      // the first moments before the user scrolls.
      gsap.to(bg, {
        scale: 1.04,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Ensure the video is ready-enough that `duration` is a valid number
      // before ScrollTrigger starts setting `currentTime`.
      const ensureMetadata = () =>
        new Promise<void>((resolve) => {
          if (video.readyState >= 1 && !Number.isNaN(video.duration)) {
            resolve();
          } else {
            video.addEventListener("loadedmetadata", () => resolve(), {
              once: true,
            });
          }
        });

      ensureMetadata().then(() => {
        const duration = video.duration || 1;

        // ------------------------------------------------------------------
        // Video seek throttle
        // ------------------------------------------------------------------
        // Writing `video.currentTime` every single scroll tick is the #1 cause
        // of stutter on scroll-driven videos — the browser has to decode to
        // the nearest keyframe each time and can't keep up.
        //
        // Strategy:
        //   - Only queue ONE seek per animation frame (rAF-coalesced).
        //   - Skip writes smaller than ~1 frame (1/30s) — imperceptible anyway.
        //   - Don't issue a new seek while the last one is still in flight.
        // ------------------------------------------------------------------
        let targetTime = 0;
        let lastWritten = -1;
        let seeking = false;
        let rafQueued = false;
        const MIN_DELTA = 1 / 30; // ~33ms — below perceptible frame size

        video.addEventListener("seeking", () => {
          seeking = true;
        });
        video.addEventListener("seeked", () => {
          seeking = false;
        });

        const flushSeek = () => {
          rafQueued = false;
          if (seeking) return; // let the in-flight seek finish first
          if (Math.abs(targetTime - lastWritten) < MIN_DELTA) return;
          video.currentTime = targetTime;
          lastWritten = targetTime;
        };

        const queueSeek = (t: number) => {
          targetTime = t;
          if (!rafQueued) {
            rafQueued = true;
            requestAnimationFrame(flushSeek);
          }
        };

        // Master timeline pinned to the hero wrapper.
        //
        // `scrub: 1.5` — slightly longer inertia makes both tweens AND the
        // video seek feel liquid. Combined with Lenis this is very smooth.
        // `ease: "power2.out"` on defaults applies to all child tweens by
        // default; video seeking uses its own rAF loop so it stays linear.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            pin: stage,
            pinSpacing: true,
            scrub: 1.5,
            markers: DEBUG_MARKERS,
            invalidateOnRefresh: true,
            // Drive the video via a throttled rAF queue — no direct writes.
            onUpdate: (self: ScrollTrigger.Vars) => {
              const progress = (self as unknown as { progress: number })
                .progress;
              // Walk continues through the zoom phase — only stops at 0.95
              // (right before the final fade-out) so the character never
              // appears frozen while being scaled.
              const walkProgress = Math.min(progress / 0.95, 1);
              const t = walkProgress * duration;
              if (!Number.isNaN(t) && Number.isFinite(t)) {
                queueSeek(t);
              }
            },
          },
        });

        // ----- Scene 1: walking (0 → 0.80) -------------------------------
        tl.to(
          title,
          { opacity: 0, y: -40, duration: 0.08, ease: "power2.in" },
          0.68,
        );

        // ----- Scene 2: approach / zoom (0.70 → 0.95) --------------------
        // Longer + eased zoom = "slow slow" organic feel. `power2.inOut`
        // starts gentle, accelerates, then eases out — mimics a real camera
        // dolly-in rather than a linear scale.
        tl.to(
          video,
          { scale: 2.5, duration: 0.25, ease: "power2.inOut" },
          0.7,
        ).to(
          bg,
          {
            yPercent: -15,
            filter: "blur(8px)",
            duration: 0.25,
            ease: "power2.inOut",
          },
          0.7,
        );

        // ----- Scene 3: handoff (0.95 → 1.00) ----------------------------
        tl.to(
          video,
          { opacity: 0, duration: 0.05, ease: "power2.out" },
          0.95,
        ).fromTo(
          nextSection,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.05,
            ease: "power2.out",
          },
          0.95,
        );
      });
    }, wrapper);

    // ScrollTrigger needs a refresh once fonts/images settle to recompute
    // trigger boundaries. Doing it on `load` keeps pin math accurate.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [introDone]);

  return (
    <>
      {/* Premium landing overlay — plays once, then unmounts. */}
      {!introDone && <IntroOverlay onDone={handleIntroDone} />}

      <section
        ref={wrapperRef}
        className={cn(
          // 280vh of scrollable space — long enough to feel unhurried, short
          // enough to keep scrub responsive.
          "relative h-[280vh] w-full",
          className,
        )}
        aria-label="Animated hero"
      >
        {/* Pinned stage: stays fixed in the viewport while wrapper scrolls. */}
        <div
          ref={stageRef}
          className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--color-background)]"
        >
          {/* Parallax background — gradient + subtle grid */}
          <div
            ref={bgRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 will-change-transform"
            style={{
              background:
                "radial-gradient(1200px 600px at 50% 30%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 80%, rgba(99,102,241,0.15), transparent 60%), linear-gradient(180deg, var(--color-background) 0%, var(--color-muted) 100%)",
            }}
          >
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage:
                  "radial-gradient(ellipse at center, black 40%, transparent 75%)",
              }}
            />
          </div>

          {/*
          Readability scrim: sits above the video but below the title so the
          headline stays legible on the bright/cream video footage. Top-heavy
          gradient keeps the character silhouette clean.
        */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[15]"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, transparent 60%, rgba(0,0,0,0.45) 100%)",
            }}
          />

          {/* Headline — sits above the video, fades out before the zoom */}
          <div
            ref={titleRef}
            className="pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 text-center text-white will-change-[transform,opacity] drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)]"
          >
            <p
            ref={titleKickerRef}
            className="mb-6 font-mono text-[0.6rem] uppercase tracking-[0.4em] md:text-xs"
            aria-hidden="true"
          >
            {kicker ?? "SCROLL TO WALK"}
          </p>
            <h1
            ref={titleHeadingRef}
            className="font-display text-5xl font-medium tracking-tight sm:text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] text-balance max-w-[90vw]"
            style={{ lineHeight: 1.1 }}
          >
            {heading ?? "Step into the story."}
          </h1>
          </div>

          {/*
          Walking character video.
          - `playsInline` + `muted` are required for iOS autoplay / seeking.
          - `preload="auto"` so `duration` is known before the first scrub tick.
          - `will-change` hints the compositor for the scale transform.
        */}
          {/*
          Fullscreen video: `absolute inset-0` + `object-cover` fills the stage
          regardless of aspect ratio. `transformOrigin` keeps the zoom centered
          on the character's midsection during Scene 2.
        */}
          <video
            ref={videoRef}
            className="absolute inset-0 z-10 h-full w-full object-cover will-change-transform"
            playsInline
            muted
            preload="auto"
            autoPlay={false}
            style={{ transformOrigin: "50% 60%" }}
          >
            <source src={videoWebm ?? VIDEO_SRC_WEBM} type="video/webm" />
            <source src={videoMp4 ?? VIDEO_SRC_MP4} type="video/mp4" />
          </video>

          {/*
          Next section reveal — lives inside the pinned stage so it can slide
          up over the character while still honoring the parent pin.
        */}
          <div
            ref={nextSectionRef}
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ transform: "translateY(100%)", opacity: 0 }}
          >
            <NextSectionContent />
          </div>

          {/* Scroll hint — only meaningful at the very top */}
          <div
            ref={scrollHintRef}
            aria-hidden
            className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/80"
            style={{ opacity: 0 }}
          >
            ↓ scroll
          </div>
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * Next section content — shown at ~80–100% of the hero scroll progress.
 * Kept in the same file to keep the handoff tightly coupled to the timeline.
 * -------------------------------------------------------------------------- */
function NextSectionContent() {
  return (
    <div className="mx-auto max-w-3xl px-6 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--color-brand-600)]">
        Chapter 2
      </p>
      <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
        The journey begins.
      </h2>
      <p className="mt-6 text-lg text-[var(--color-muted-foreground)]">
        From a single step to a full experience — crafted with Next.js, GSAP,
        and a touch of obsession.
      </p>
    </div>
  );
}
