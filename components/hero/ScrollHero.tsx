"use client";

/**
 * ScrollHero
 * ----------------------------------------------------------------------------
 * Scroll-driven cinematic hero built with GSAP + ScrollTrigger.
 *
 * Layout trick:
 *   We reserve ~280vh of scrollable space via a wrapper <section>. Inside it we
 *   pin a 100vh "stage" so it stays fixed on screen while the user scrolls
 *   through that 280vh range. All motion is "scrubbed" — tied 1:1 to scroll
 *   position, not to real time.
 *
 * Three scenes on the master timeline (0 → 1 scroll progress):
 *   Scene 1  (0.00 → 0.65) :: walk      — video.currentTime follows progress
 *   Scene 2  (0.65 → 0.85) :: approach  — scale up, bg blurs OUT
 *   Scene 3  (0.80 → 1.00) :: handoff   — curtain wipes up (covers blurry video),
 *                                          then content fades in on top
 *
 * Fix 1 — Video lag/stutter:
 *   - Removed the `seeking` guard that was blocking seeks mid-flight and causing
 *     the video to "snap" to catch up. Instead we always write to currentTime
 *     but coalesce writes to one per rAF.
 *   - Reduced scrub from 1.5 → 1.2 so the seek target stays closer to the
 *     actual scroll position, reducing the visible lag window.
 *   - Added `transform: translateZ(0)` to force GPU layer promotion on first
 *     paint before GSAP adds will-change.
 *   - Removed the continuous 8s breathing animation on `bg` that was fighting
 *     the compositor thread (it ran even during scrubbing).
 *
 * Fix 2 — Ugly blurry transition moment:
 *   - Replaced the "slide nextSection up over blurry video" approach with an
 *     industry-standard CURTAIN approach:
 *       a) A solid-coloured panel (#curtain) slides UP from the bottom, fully
 *          covering the blurry zoomed video — user never sees the ugly state.
 *       b) Once the curtain covers the viewport, the actual next-section content
 *          fades in on top of the curtain.
 *   - This is the same technique used by Awwwards-winning sites (e.g. Cher Ami,
 *     Active Theory) — the viewer's eye follows the clean curtain wipe, not a
 *     blurry half-covered transition.
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
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const nextSectionRef = useRef<HTMLDivElement | null>(null);

  // Gate the scroll-driven GSAP setup behind the intro animation. While
  // `introDone` is false we render the <IntroOverlay/> and do nothing else.
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  useLayoutEffect(() => {
    if (!introDone) return;

    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const bg = bgRef.current;
    const title = titleRef.current;
    const kickerEl = titleKickerRef.current;
    const headingEl = titleHeadingRef.current;
    const scrollHint = scrollHintRef.current;
    const curtain = curtainRef.current;
    const nextSection = nextSectionRef.current;
    if (
      !wrapper ||
      !stage ||
      !video ||
      !bg ||
      !title ||
      !kickerEl ||
      !headingEl ||
      !scrollHint ||
      !curtain ||
      !nextSection
    )
      return;

    // ------------------------------------------------------------------
    // Accessibility: reduced-motion fallback.
    // ------------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      gsap.set([curtain, nextSection], { clearProps: "all" });
      curtain.style.transform = "translateY(0)";
      nextSection.style.opacity = "1";

      video.loop = true;
      video.autoplay = true;
      video.play().catch(() => {});

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

    const ctx = gsap.context(() => {
      // ------------------------------------------------------------------
      // Landing reveal — plays ONCE right after the intro overlay lifts.
      // ------------------------------------------------------------------
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .fromTo(
          kickerEl,
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
          headingEl,
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
        // FIX 1: Improved video seek — rAF-coalesced, no blocking on seeking.
        // ------------------------------------------------------------------
        // The old code had a `seeking` guard that refused to write currentTime
        // while the browser was decoding the previous seek. This caused the
        // video to fall behind scroll and then snap. The fix: always queue the
        // latest target and write it every rAF — the browser handles duplicate
        // seeks gracefully, and the "snap" behaviour disappears.
        // ------------------------------------------------------------------
        let targetTime = 0;
        let lastWritten = -1;
        let rafQueued = false;
        const MIN_DELTA = 1 / 60; // one 60fps frame — below this is imperceptible

        const flushSeek = () => {
          rafQueued = false;
          // Skip sub-frame writes — imperceptible and burns decode budget.
          if (Math.abs(targetTime - lastWritten) < MIN_DELTA) return;
          try {
            video.currentTime = targetTime;
            lastWritten = targetTime;
          } catch {
            // Ignore DOMException — can fire if video element is mid-teardown.
          }
        };

        const queueSeek = (t: number) => {
          targetTime = t;
          if (!rafQueued) {
            rafQueued = true;
            requestAnimationFrame(flushSeek);
          }
        };

        // ------------------------------------------------------------------
        // Master timeline pinned to the hero wrapper.
        //
        // scrub: 1.2 (was 1.5) — tighter lag means the seek target stays
        // closer to actual scroll position; less visible "catch-up" snaps.
        // ------------------------------------------------------------------
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            pin: stage,
            pinSpacing: true,
            scrub: 1.2,
            markers: DEBUG_MARKERS,
            invalidateOnRefresh: true,
            onUpdate: (self: ScrollTrigger.Vars) => {
              const progress = (self as unknown as { progress: number })
                .progress;
              // Video plays through walk + zoom phase, freezes when curtain covers.
              // We stop advancing at 0.85 — past that the curtain hides the video.
              const walkProgress = Math.min(progress / 0.85, 1);
              const t = walkProgress * duration;
              if (!Number.isNaN(t) && Number.isFinite(t)) {
                queueSeek(t);
              }
            },
          },
        });

        // ----- Scene 1: walking (0 → 0.65) --------------------------------
        // Title fades out just before the zoom starts.
        tl.to(
          title,
          { opacity: 0, y: -40, duration: 0.07, ease: "power2.in" },
          0.60,
        );

        // ----- Scene 2: approach / zoom (0.65 → 0.85) --------------------
        // Zoom the video; simultaneously blur bg behind it.
        // NOTE: We deliberately do NOT apply blur to bg here — blurring the
        // background while it's hidden by the video creates the ugly "blurry
        // state" the user sees. Instead we only scale the video itself.
        tl.to(
          video,
          { scale: 2.2, duration: 0.20, ease: "power2.inOut" },
          0.65,
        );

        // Fade the bg (gradient) out as the video fills the frame.
        tl.to(
          bg,
          { opacity: 0, duration: 0.15, ease: "power1.in" },
          0.65,
        );

        // ----- Scene 3: curtain wipe + handoff (0.80 → 1.00) -------------
        //
        // FIX 2: Industry-standard "curtain over transition" pattern.
        //
        // Step A (0.80 → 0.93): A solid curtain panel slides UP from the
        // bottom of the viewport, fully covering the zoomed blurry video.
        // The user's eye follows the clean wipe edge — they never see the
        // ugly blurry video state.
        //
        // Step B (0.90 → 1.00): The actual next-section content fades in
        // on top of the curtain. Because the curtain and the next section
        // share the same background colour, the fade-in is seamless — it
        // just looks like the text/content appearing on a clean surface.
        //
        // This is identical to the technique used on high-end Awwwards sites
        // (Cher Ami, Hi-Réel, Active Theory) where scroll-driven video
        // transitions cut to a clean colour rather than compositing over a
        // half-blurred frame.
        //
        // Initial curtain state: translateY(100%) (below viewport)
        tl.to(
          curtain,
          {
            yPercent: 0,
            duration: 0.20,
            ease: "power3.inOut",
          },
          0.80,
        );

        // While curtain slides up, start fading the video out so the curtain
        // doesn't need to be fully opaque — belt-and-suspenders.
        tl.to(
          video,
          { opacity: 0, duration: 0.12, ease: "power1.in" },
          0.82,
        );

        // Step B: Content fades in on top of the (now fully covering) curtain.
        tl.fromTo(
          nextSection,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.10,
            ease: "power2.out",
          },
          0.92,
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
            className="pointer-events-none absolute inset-0 will-change-[opacity]"
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
          headline stays legible on the bright/cream video footage.
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
          - `playsInline` + `muted` required for iOS autoplay / seeking.
          - `preload="auto"` so `duration` is known before the first scrub tick.
          - `transform: translateZ(0)` forces GPU layer promotion from first paint
            before GSAP adds will-change — prevents the brief compositor hiccup
            on first scroll.
        */}
          <video
            ref={videoRef}
            className="absolute inset-0 z-10 h-full w-full object-cover will-change-transform"
            playsInline
            muted
            preload="auto"
            autoPlay={false}
            style={{ transformOrigin: "50% 60%", transform: "translateZ(0)" }}
          >
            <source src={videoWebm ?? VIDEO_SRC_WEBM} type="video/webm" />
            <source src={videoMp4 ?? VIDEO_SRC_MP4} type="video/mp4" />
          </video>

          {/*
          CURTAIN PANEL — FIX 2
          Sits above the video (z-25) but below the next-section content (z-30).
          Starts fully below the viewport (translateY 100%) and slides up to
          cover the blurry zoomed video during the handoff phase.
          Uses the same background colour as the stage so the wipe edge looks
          intentional, not like a bug.
        */}
          <div
            ref={curtainRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[25] bg-[var(--color-background)] will-change-transform"
            style={{ transform: "translateY(100%)" }}
          />

          {/*
          Next section reveal — lives inside the pinned stage.
          Fades in on top of the solid curtain — no blurry video behind it.
        */}
          <div
            ref={nextSectionRef}
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ opacity: 0 }}
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
 * Next section content — shown at ~90–100% of the hero scroll progress.
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
