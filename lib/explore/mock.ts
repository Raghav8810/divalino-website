/**
 * Editorial panels for the Explore section.
 *
 * Each panel is a full-viewport "chapter" with a hero photograph, a short
 * eyebrow tag, a bold headline, and one paragraph of body copy. The
 * ExploreSection component pins each panel and reveals the text on scroll
 * over a deep-ink scrim that rises from below.
 */

export type ExplorePanel = {
  id: string;
  eyebrow?: string;
  heading: string;
  body?: string;
  /** Hero image URL — Unsplash collections that match the atelier mood. */
  image: string;
};

export const EXPLORE_PANELS: ExplorePanel[] = [
  {
    id: "obsession",
    eyebrow: "Chapter 01",
    heading: "Crafted with obsession.",
    body: "Every seam is sketched, draped and re-draped until the silhouette feels inevitable. We don't ship a piece until we'd wear it ourselves — twice.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=80",
  },
  {
    id: "fabric",
    eyebrow: "Chapter 02",
    heading: "The fabric is the story.",
    body: "Italian silks, hand-loomed wools, Japanese cottons. We travel for the cloth and we never compromise — because the way a garment moves is the way it lives.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=80",
  },
  {
    id: "atelier",
    eyebrow: "Chapter 03",
    heading: "Made in our atelier.",
    body: "A small team of cutters and tailors, working under one roof, making fewer than three hundred pieces a season. Slow on purpose. Built to be remembered.",
    image:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=2400&q=80",
  },
  {
    id: "details",
    eyebrow: "Chapter 04",
    heading: "Details you can feel.",
    body: "Hand-rolled hems, Japanese horn buttons, French canvas. The pieces no one notices are the ones that make the garment last a decade.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=80",
  },
  {
    id: "lasting",
    eyebrow: "Chapter 05",
    heading: "Built to be inherited.",
    body: "Fashion that outlives the season. We design for the daughter who borrows it twenty years from now — that's the only timeline that matters.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2400&q=80",
  },
];
