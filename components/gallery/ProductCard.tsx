"use client";

/**
 * ProductCard
 * ----------------------------------------------------------------------------
 * A single 3:4 portrait card used inside the horizontal gallery.
 *
 * VISUAL LANGUAGE — "Geospace editorial"
 * ---------------------------------------
 *  - Image-as-poster: photograph fills the entire card, no caption strip.
 *  - Sharp 2px corners — magazine, not app card.
 *  - No drop shadows on the card itself (flat editorial).
 *  - On idle: only minimal top-left category meta is visible. The image is
 *    the hero. Title sits at the bottom in compact serif.
 *  - On active scroll position: the IMAGE zooms (scale 1.08) inside the
 *    fixed-size card frame — that's the cinematic "stepping into the photo"
 *    feel from the Geospace Webflow template.
 *  - On hover: dark gradient lifts in from below + underlined "View Details"
 *    slides up. No magnet drift any more — too noisy at this card size.
 *
 * PERFORMANCE-CRITICAL DESIGN
 * ---------------------------
 * The active/inactive state is driven by a `data-active` HTML attribute the
 * parent toggles via DIRECT DOM writes (no React state, no re-renders during
 * scroll). All visual properties react via plain CSS attribute selectors and
 * the `--card-scale` variable defined in globals.css.
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/lib/products/types";


type Props = {
  product: Product;
  /** True for the first card on the page so we can prioritise its image. */
  priority?: boolean;
  /** True if next/image should eagerly load (used for ±1 from active). */
  eager?: boolean;
};

export function ProductCard({ product, priority = false, eager = false }: Props) {
  const [hovered, setHovered] = useState(false);
  console.log({ "product": product });

  return (
    <Link
      href={`/products/${product.slug}`}
      // Default to inactive; parent flips this attribute imperatively.
      data-active="false"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "product-card group relative block flex-shrink-0 overflow-hidden bg-[var(--color-muted)]",
        // Geospace edge-to-edge: no radius, cards seam together.
        "rounded-none",
        // Big editorial cards.
        "aspect-[3/4] w-[85vw] sm:w-[65vw] md:w-[48vw] lg:w-[34vw] xl:w-[30vw] 2xl:w-[28vw]",
        "will-change-transform [transform-style:preserve-3d] [backface-visibility:hidden]",
      )}
      // No card-frame scaling — cards sit edge-to-edge. The cinematic
      // emphasis on the active card is delivered by the IMAGE zoom inside
      // (see globals.css → .product-card[data-active="true"] img).
      style={undefined}
    >
      {/*
        Image layer — this is where the cinematic Geospace-style zoom lives.
        Two stacked transforms:
          - Active (data-active=true) on the parent → image zooms to 1.08
          - Hover                                   → image zooms to 1.12
        Implemented entirely in CSS attribute selectors so scrolling never
        re-renders React. The hover scale is added via a class on top.
      */}
      <div
        className="product-card__media absolute inset-0 [transform:translateZ(0)]"
        data-hovered={hovered ? "true" : "false"}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 90vw, (max-width: 1280px) 50vw, 35vw"
          priority={priority}
          loading={priority || eager ? "eager" : "lazy"}
          className="object-cover will-change-transform [backface-visibility:hidden]"
        />
      </div>

      {/* Walnut hover gradient — lifts from the bottom only, no full overlay. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          hovered ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "linear-gradient(to top, rgba(26,22,19,0.65) 0%, rgba(26,22,19,0.15) 45%, rgba(26,22,19,0) 70%)",
        }}
      />

      {/* Permanent thin scrim at the very bottom for title legibility — even
          before hover the title needs to read on bright photos. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to top, rgba(26,22,19,0.45) 0%, rgba(26,22,19,0) 100%)",
        }}
      />

      {/* Top-left meta — minimal, single line, uppercase tracked. */}
      <div className="absolute left-5 top-5 z-10 text-white">
        <span className="text-[0.65rem] uppercase tracking-[0.28em] text-white/85">
          {product.category} · {product.season}
        </span>
      </div>

      {/* Bottom-left title block. Price drops in only on hover. */}
      <div className="absolute inset-x-5 bottom-5 z-10 text-white">
        <h3 className="font-display text-2xl leading-[1.1] md:text-[2rem]">
          {product.name}
        </h3>

        {/* Hover-revealed row: price + "View Details" underline */}
        <div
          className={cn(
            "mt-2 flex items-end justify-between gap-4 transition-all duration-500",
            hovered
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0",
          )}
        >
          <p className="text-sm tracking-wide text-white/90">
            {product.price != null ? `$${product.price.toLocaleString()}` : "demo22"}
          </p>
          <span className="relative inline-flex items-center text-[0.7rem] uppercase tracking-[0.24em]">
            View Details
            {/* Hairline underline — Geospace signature touch. */}
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-px bg-white"
              style={{
                width: hovered ? "100%" : "0%",
                transition: "width 600ms cubic-bezier(0.22, 1, 0.36, 1) 80ms",
              }}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
