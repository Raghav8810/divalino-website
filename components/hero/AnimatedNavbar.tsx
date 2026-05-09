"use client";

/**
 * AnimatedNavbar
 * ----------------------------------------------------------------------------
 * Fully transparent overlay navbar in a 3-column layout:
 *
 *   [ LOGO (left) ]   [ NAV LINKS (center) ]   [ ICONS (right) ]
 *
 * Behaviour:
 *  - Fixed + transparent (no background, no backdrop blur, no border)
 *  - Starts hidden (translateY(-100%) + opacity 0)
 *  - Reveals between ~40–120px of native scroll — same feel as before
 *  - z-[9999] ensures it's ALWAYS above pinned ScrollTrigger content
 *  - Nav links scroll to on-page sections using Lenis scrollTo for buttery
 *    smooth motion that stays in sync with GSAP ScrollTrigger pins/scrubs.
 *
 * Color strategy (smart theme detection):
 *   Instead of a single scroll threshold, we probe the element directly
 *   underneath the navbar's center via `document.elementFromPoint` on
 *   every scroll tick. If that element (or any ancestor up to <body>)
 *   carries `data-navbar-theme="dark"`, we set text to white. Otherwise
 *   the navbar assumes a light surface and switches to dark text.
 *   This handles arbitrarily ordered sections, pinned overlays, and
 *   dynamic content without needing manual scroll-position breakpoints.
 *
 * Scroll-to strategy:
 *   We grab the global Lenis instance from `window.__lenis` (set by
 *   SmoothScrollProvider) and call `lenis.scrollTo(target, { ... })`.
 *   Lenis handles the interpolation through its own easing curve, which
 *   means the scroll-to feels identical to manual scrolling — no jank,
 *   no jump, and all ScrollTriggers fire naturally along the way.
 *
 *   On click we also play a tiny GSAP micro-animation on the link text
 *   (letter-spacing burst → settle) for that awwwards tactile feedback.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag, User } from "lucide-react";
import { gsap } from "@/lib/motion/gsap";

/**
 * Nav items ordered to match the visual page flow:
 *   Hero → Featured Pieces → Explore → Journal (Blog) → Our Story
 *
 * `target` is the CSS id selector of the section to scroll to.
 */
const NAV_ITEMS = [
  { target: "#featured-pieces", label: "Features" },
  { target: "#explore", label: "Explore" },
  { target: "#journal", label: "Blog" },
  { target: "#our-story", label: "Our Story" },
  { target: "#contact", label: "Contact Us" },
];

// Reveal window in pixels — between these two values the navbar animates in.
const REVEAL_START = 40;
const REVEAL_END = 120;

// Offset so the section heading isn't hidden behind the fixed navbar (64px h).
const SCROLL_OFFSET = -80;

/**
 * Walks up the DOM tree from `el` to find the nearest ancestor (or self)
 * with a `data-navbar-theme` attribute. Returns its value, or null.
 */
function findNavbarTheme(el: Element | null): string | null {
  let node = el;
  while (node && node !== document.body) {
    const theme = (node as HTMLElement).dataset?.navbarTheme;
    if (theme) return theme;
    node = node.parentElement;
  }
  return null;
}

export function AnimatedNavbar() {
  const [progress, setProgress] = useState(0); // 0 → hidden, 1 → visible
  // `onDark` = true when the navbar sits above a dark-surfaced section.
  // Text should be white. When false, text is dark (ink).
  const [onDark, setOnDark] = useState(true); // start dark (hero is dark)
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const linkRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // ---- Smooth scroll to section via Lenis ----------------------------------
  const scrollToSection = useCallback(
    (target: string, linkEl: HTMLButtonElement | null) => {
      const el = document.querySelector(target);
      if (!el) return;

      // Grab the Lenis instance that SmoothScrollProvider attached to window.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;

      if (lenis) {
        // Lenis scrollTo uses the same easing curve as manual scroll —
        // all ScrollTriggers fire naturally along the way. Duration is
        // 2.8s with a gentle cubic ease — slow enough to feel luxurious,
        // fast enough to not feel sluggish. The user sees every section
        // glide past smoothly, exactly like an awwwards fashion site.
        lenis.scrollTo(el, {
          offset: SCROLL_OFFSET,
          duration: 2.8,
          // Gentle cubic ease-out: starts strong, settles softly.
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });
      } else {
        // Fallback: no Lenis (reduced motion / SSR). Use native smooth scroll.
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // --- Micro-animation: click feedback on the link text -----------------
      // Awwwards-style tactile burst: letter-spacing widens briefly then
      // settles back. Subtle but it makes every click feel "designed".
      if (linkEl) {
        gsap.fromTo(
          linkEl,
          { letterSpacing: "0.22em" },
          {
            letterSpacing: "0.38em",
            duration: 0.2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          },
        );
      }
    },
    [],
  );

  // ---- Animated underline indicator ----------------------------------------
  // Moves a tiny highlight bar under the currently-active nav link. We use
  // GSAP to tween its `left` and `width` so the bar slides from link to link
  // with a fluid, spring-like motion.
  const moveIndicator = useCallback((target: string | null) => {
    const indicator = indicatorRef.current;
    const nav = navRef.current;
    if (!indicator || !nav || !target) {
      if (indicator) gsap.to(indicator, { opacity: 0, duration: 0.25 });
      return;
    }
    const linkEl = linkRefs.current.get(target);
    if (!linkEl) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();

    gsap.to(indicator, {
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
      duration: 0.45,
      ease: "expo.out",
    });
  }, []);

  // ---- Intersection Observer: track which section is in the viewport -------
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.target.replace("#", ""));
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio as "active".
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!best || entry.intersectionRatio > best.intersectionRatio)
          ) {
            best = entry;
          }
        }
        if (best) {
          const id = `#${best.target.id}`;
          setActiveSection(id);
        }
      },
      { threshold: [0, 0.15, 0.35, 0.5], rootMargin: "-80px 0px -30% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Slide the indicator whenever the active section changes.
  useEffect(() => {
    moveIndicator(activeSection);
  }, [activeSection, moveIndicator]);

  // ---- Scroll-based reveal + smart theme detection -------------------------
  useEffect(() => {
    const compute = () => {
      const y = window.scrollY;
      const p =
        y <= REVEAL_START
          ? 0
          : y >= REVEAL_END
            ? 1
            : (y - REVEAL_START) / (REVEAL_END - REVEAL_START);
      setProgress(p);

      // ---- Smart theme detection via elementFromPoint ----------------------
      // Temporarily hide the navbar so elementFromPoint doesn't hit itself,
      // probe the element underneath, then restore.
      const header = headerRef.current;
      if (header) {
        const prevPointerEvents = header.style.pointerEvents;
        header.style.pointerEvents = "none";
        // Probe at the center of the viewport, 32px from top (navbar midpoint).
        const probeEl = document.elementFromPoint(window.innerWidth / 2, 32);
        header.style.pointerEvents = prevPointerEvents;

        const theme = findNavbarTheme(probeEl);
        // If the probed section says "dark", navbar text should be white.
        // If "light" or no attribute, we default based on scroll position:
        // before the hero ends → dark (white text), after → light (dark text).
        if (theme === "dark") {
          setOnDark(true);
        } else if (theme === "light") {
          setOnDark(false);
        } else {
          // No explicit theme attribute — fallback to scroll position.
          // Before the hero's end (~280vh) we're over the dark video.
          setOnDark(y < window.innerHeight * 2.4);
        }
      }

      rafRef.current = null;
    };

    const onScroll = () => {
      // rAF-throttle: avoid re-rendering on every scroll tick
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(compute);
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      // z-[9999] ensures the navbar is ALWAYS above everything — including
      // GSAP ScrollTrigger pin-spacers which create new stacking contexts.
      className="fixed inset-x-0 top-0 z-[9999] transition-[color,background-color,backdrop-filter] duration-300"
      style={{
        transform: `translate3d(0, ${(progress - 1) * 100}%, 0)`,
        opacity: progress,
        willChange: "transform, opacity",
        color: "#111111", // Consistent dark text for the light background
        // Light frosted glass backdrop — looks premium and ensures the color logo is visible
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
      }}
      data-theme="light"
    >
      {/*
        3-column grid: `1fr auto 1fr` guarantees the center column stays
        perfectly centered regardless of left/right content width — which a
        simple flex `justify-between` cannot. This matches the reference
        image's brand-center-icons composition exactly.
      */}
      <div
        className="mx-auto grid h-16 w-full max-w-[var(--container-max)] items-center px-4 md:px-8"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        {/* Left — logo / wordmark */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center"
          >
            <img src="/logo-color.svg" alt="Divalino Logo" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Center — primary nav with sliding indicator */}
        <nav
          ref={navRef}
          className="relative flex items-center gap-8 text-[0.75rem] uppercase tracking-[0.22em]"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              ref={(el) => {
                if (el) linkRefs.current.set(item.target, el);
              }}
              type="button"
              onClick={() =>
                scrollToSection(item.target, linkRefs.current.get(item.target) ?? null)
              }
              className={`relative cursor-pointer bg-transparent border-none p-0 transition-opacity duration-200 ${activeSection === item.target ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              style={{ font: "inherit", color: "inherit", letterSpacing: "0.22em" }}
            >
              {item.label}
            </button>
          ))}

          {/* Sliding active indicator — a thin line that glides between links */}
          <span
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute -bottom-1.5 h-[1.5px] rounded-full"
            style={{
              background: "currentColor",
              opacity: 0,
              willChange: "left, width, opacity",
            }}
          />
        </nav>

        {/* Right — icon actions */}
        <div className="flex items-center justify-end gap-3">
          <IconButton label="Cart">
            <ShoppingBag size={16} strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Account">
            <User size={16} strokeWidth={1.5} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------------
 * Icon button — uses currentColor so it inherits whichever theme the navbar
 * is currently in (white over hero, ink over gallery).
 * -------------------------------------------------------------------------- */
function IconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border opacity-90 transition-opacity hover:opacity-100"
      style={{ borderColor: "currentColor", borderWidth: 1 }}
    >
      {children}
    </button>
  );
}
