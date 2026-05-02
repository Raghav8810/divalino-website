"use client";

/**
 * Footer — awwwards-style editorial footer for the atelier site.
 *
 * Visual recipe
 * -------------
 *  - Deep walnut/near-black background (`--color-surface-deep`, `#2a2520`)
 *    with cream text — a calmer, warmer take on "black with white" that
 *    keeps the site visually unified rather than jarringly inverted.
 *  - Antique-gold accents on labels and dividers (single brand colour).
 *  - Massive Humane wordmark across the top — the page signs off the way
 *    it greeted you.
 *  - 3-column link grid (Atelier / Visit / Follow) + a slim newsletter
 *    capture, separated by a hairline rule.
 *  - Centered baseline: copyright + "Made with love in Como" + a small
 *    "back to top" button on the right.
 *
 * Animation
 * ---------
 *  - Wordmark reveals word-by-word with the same clip-mask + rotate
 *    pattern used everywhere else, so the footer feels of a piece.
 *  - Each link column fades up with a stagger as it enters the viewport.
 *  - Each social icon scales in with its own micro-stagger for a small
 *    delightful flourish.
 *  - Baseline row (copyright / made with love) eases up last.
 *  - All wired through a single paused timeline + ScrollTrigger so it
 *    never replays mid-scroll. `prefers-reduced-motion` respected.
 */

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

const NAV_COLUMNS: { label: string; links: { label: string; href: string }[] }[] =
  [
    {
      label: "Shop",
      links: [
        { label: "Collections", href: "#" },
        { label: "Bespoke", href: "#" },
        { label: "Journal", href: "#" },
        { label: "Lookbook", href: "#" },
      ],
    },
    {
      label: "Visit",
      links: [
        { label: "Como", href: "#" },
        { label: "Milan", href: "#" },
        { label: "Book a fitting", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      label: "Care",
      links: [
        { label: "Shipping", href: "#" },
        { label: "Returns", href: "#" },
        { label: "Sizing", href: "#" },
        { label: "Garment care", href: "#" },
      ],
    },
  ];

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          d="M14 21v-7h2.4l.4-3H14V9c0-.9.3-1.5 1.6-1.5H17V4.8C16.7 4.7 15.8 4.6 14.8 4.6 12.7 4.6 11.2 5.9 11.2 8.3V11H9v3h2.2v7H14z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/0000000000",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M8.6 8.7c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.5c-.2.2-.3.4-.1.7.2.4.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.7-.8c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.6.4 0 .2 0 1.1-.4 2.1-.4 1-2 1.9-2.9 2-.7.1-1.7.1-4.1-.9-3.5-1.5-5.7-5-5.9-5.3-.2-.3-1.4-1.9-1.4-3.6s.9-2.5 1.2-2.8c.3-.3.7-.4.9-.4z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

type Props = {
  tagline?: string;
  heading?: string;
  newsletterText?: string;
  copyright?: string;
  navColumns?: Array<{
    label: string;
    links: Array<{ label: string; href: string }>;
  }>;
};

export function Footer({ tagline, heading, newsletterText, copyright, navColumns }: Props) {
  const footerRef = useRef<HTMLElement | null>(null);

  // Fallback to the original hardcoded columns if not provided by CMS
  const columns = navColumns && navColumns.length > 0 ? navColumns : NAV_COLUMNS;

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const eyebrow = footer.querySelector<HTMLElement>("[data-foot-eyebrow]");
      const words = footer.querySelectorAll<HTMLElement>("[data-foot-word]");
      const cols = footer.querySelectorAll<HTMLElement>("[data-foot-col]");
      const socials = footer.querySelectorAll<HTMLElement>("[data-foot-social]");
      const base = footer.querySelectorAll<HTMLElement>("[data-foot-base]");

      gsap.set(eyebrow, { y: 24, opacity: 0 });
      gsap.set(words, { yPercent: 130, opacity: 0, rotate: 4 });
      gsap.set(cols, { y: 32, opacity: 0 });
      gsap.set(socials, { scale: 0.6, opacity: 0 });
      gsap.set(base, { y: 16, opacity: 0 });

      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(eyebrow, { y: 0, opacity: 1, duration: 0.8 }, 0)
        .to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.4,
            stagger: 0.12,
          },
          0.1,
        )
        .to(
          cols,
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.55,
        )
        .to(
          socials,
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "back.out(1.6)",
          },
          0.85,
        )
        .to(
          base,
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
          1.05,
        );

      const trigger = ScrollTrigger.create({
        trigger: footer,
        start: "top 85%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.progress(0).pause(),
      });

      // Fire immediately if the footer is already in view on init.
      if (trigger.progress > 0) tl.play();
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      data-navbar-theme="dark"
      className="relative overflow-hidden bg-[var(--color-surface-deep)] text-[var(--color-background)]"
      style={{ fontFamily: "var(--font-satoshi)" }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 md:px-10 md:pt-16 md:pb-10">
        {/* ---------- Eyebrow + giant wordmark ---------- */}
        <p
          data-foot-eyebrow
          className="mb-4 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-brand-300)] will-change-transform"
          style={{ fontWeight: 500 }}
        >
          Slow fashion · Considered design · crafted in india
        </p>

        <h2
          className="mb-10 leading-[0.92] text-[var(--color-background)] md:mb-14"
          style={{
            fontFamily: "var(--font-humane)",
            fontWeight: 500,
            fontSize: "clamp(4rem, 14vw, 14rem)",
            letterSpacing: "0.005em",
          }}
        >
          {"DRESSED IN INTENTION.".split(" ").map((word, idx) => (
            <span
              key={idx}
              className="inline-block overflow-hidden align-bottom"
              style={{ marginRight: "0.18em", paddingBottom: "0.06em" }}
            >
              <span
                data-foot-word
                className="inline-block will-change-transform"
              >
                {word}
              </span>
            </span>
          ))}
        </h2>

        {/* ---------- Hairline rule ---------- */}
        <div className="h-px w-full bg-[var(--color-background)]/15" />

        {/* ---------- Link grid + newsletter ---------- */}
        <div className="grid grid-cols-2 gap-8 pt-8 md:grid-cols-12 md:gap-8 md:pt-10">
          {/* Brand blurb + newsletter */}
          <div data-foot-col className="col-span-2 md:col-span-5 will-change-transform">
            <p className="mb-6 max-w-sm text-sm text-[var(--color-surface)]/70">
              {newsletterText ?? "Sign up for occasional dispatches from the workroom. No noise, just new pieces and notes on craft."}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative flex max-w-md items-center gap-3 border-b border-[var(--color-background)]/30 pb-3 transition-colors duration-300 focus-within:border-[var(--color-brand-300)]"
            >
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 bg-transparent text-base text-[var(--color-background)] outline-none placeholder:text-[var(--color-background)]/40 md:text-lg"
                style={{ fontWeight: 500 }}
              />
              <button
                type="submit"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[var(--color-background)] transition-colors hover:text-[var(--color-brand-300)]"
                style={{ fontWeight: 600 }}
              >
                Subscribe
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M1 5h12M13 5L9 1m4 4L9 9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Spacer on desktop. */}
          <div className="hidden md:col-span-1 md:block" aria-hidden />

          {/* Nav columns. */}
          {columns.map((col) => (
            <nav
              key={col.label}
              data-foot-col
              className="col-span-1 md:col-span-2 will-change-transform"
              aria-label={col.label}
            >
              <p
                className="mb-4 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-brand-300)]"
                style={{ fontWeight: 500 }}
              >
                {col.label}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center text-base text-[var(--color-background)]/85 transition-colors duration-300 hover:text-[var(--color-brand-300)]"
                      style={{ fontWeight: 500 }}
                    >
                      <span className="relative">
                        {link.label}
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-[width] duration-300 group-hover:w-full"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---------- Social row ---------- */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--color-background)]/15 pt-6 md:mt-14 md:flex-row md:items-center md:justify-between">
          <p
            data-foot-base
            className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-brand-300)] will-change-transform"
            style={{ fontWeight: 500 }}
          >
            Follow us
          </p>
          <ul className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <li key={s.label} data-foot-social className="will-change-transform">
                <a
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-background)]/25 text-[var(--color-background)] transition-[background-color,color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-300)] hover:text-[var(--color-surface-deep)]"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Baseline ---------- */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center md:mt-10">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-surface)]/10 pt-8 text-[0.65rem] tracking-wider uppercase text-[var(--color-surface)]/40 md:flex-row">
            <p>{copyright ?? `© ${new Date().getFullYear()} Learning Web. All rights reserved.`}</p>
          </div>
          {/* <p
            data-foot-base
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-brand-300)] will-change-transform"
            style={{ fontWeight: 500 }}
          >
            Made with
            <span aria-hidden className="text-[var(--color-brand-300)]">
              <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
                <path
                  d="M6 10S0.75 6.75 0.75 3.5A2.75 2.75 0 016 1.875 2.75 2.75 0 0111.25 3.5C11.25 6.75 6 10 6 10z"
                  fill="currentColor"
                />
              </svg>
            </span>
            love in Como, Italy
          </p> */}
        </div>
      </div>
    </footer>
  );
}
