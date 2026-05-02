"use client";

/**
 * InlineImagePill — a small pill-shaped photograph that flows inline with
 * surrounding text, like a graphic punctuation mark.
 *
 * Used inside the "Our Story" section's manifesto paragraph so phrases like
 * "...quality fabrics..." can be visually anchored by an actual fabric photo.
 *
 * Why an inline-flex span (not <Image fill>):
 *  - We want it to behave like a word in the line: line-break around it,
 *    inherit baseline, vertical-center on the cap height.
 *  - We let the parent paragraph's font-size drive the pill height via `em`,
 *    so the pill always reads at ~70% of the line height — never overpowers
 *    the type.
 */

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type Props = {
  src: string;
  alt: string;
  /** Aspect ratio, expressed as width:height. Default 1.6:1 (photo pill). */
  aspect?: number;
  className?: string;
};

export function InlineImagePill({
  src,
  alt,
  aspect = 1.9,
  className,
}: Props) {
  // Heights chosen so the pill sits inside the line's cap height with a touch
  // of breathing room. width = height * aspect.
  return (
    <span
      className={cn(
        "relative mx-3 md:mx-4 inline-block overflow-hidden align-middle",
        // Pill shape — fully rounded ends.
        "rounded-full",
        // Subtle warm shadow for depth, matches atelier palette.
        "shadow-[0_4px_18px_-6px_rgba(26,22,19,0.25)]",
        // GPU layer hint to keep the inline element from kicking layout
        // recalcs around it during scroll.
        "[transform:translateZ(0)]",
        className,
      )}
      style={{
        // Pill height is a fraction of the surrounding font size, so it
        // visually scales with the paragraph's typography. Bumped up so the
        // pill reads as a deliberate inline element, not a stamp.
        height: "1.05em",
        width: `${1.05 * aspect}em`,
        // Slight optical lift — pills look better dropped a hair below the
        // mathematical baseline when set in a flowing line.
        verticalAlign: "-0.18em",
      }}
      aria-hidden
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="120px"
        className="object-cover"
      />
    </span>
  );
}
