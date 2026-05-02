/**
 * Journal entries — short editorial pieces about fabric, craft, and the
 * atelier. Surfaced on the home page in a 7-tile bento grid (two of the
 * tiles are wider, matching the canonical Aceternity layout).
 */

export type JournalEntry = {
  id: string;
  title: string;
  description?: string;
  /** Hero photograph for the tile header. Unsplash, atelier-mood. */
  image: string;
};

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "italian-silk",
    title: "Italian Silk, Up Close",
    description:
      "How a Como mill weaves the satin we use for our evening gowns — twelve threads to the millimetre.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "japanese-cotton",
    title: "Japanese Cotton, Slow",
    description:
      "Selvedge looms in Okayama still run at six metres an hour. We think that's a feature, not a bug.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "hand-rolled-hems",
    title: "The Hand-Rolled Hem",
    description:
      "Three hours of work on a piece nobody will ever see. Why we still insist on it.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "wool-from-yorkshire",
    title: "Wool from Yorkshire",
    description:
      "A 200-year-old mill. Rain-washed water from the moors. The reason our coats hang the way they do — and why we travel north four times a year to sit at the loom and watch.",
    image:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "buttons",
    title: "Horn, Shell, Bone.",
    description:
      "The buttons we choose, and the ones we won't.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "linen-summer",
    title: "Linen for Summer",
    description:
      "Belgian flax, washed three times before the cut.",
    image:
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "atelier-day",
    title: "A Day in the Atelier",
    description:
      "From the morning's first cup of espresso to the last fitting at six — the rhythm of a small team making fewer than three hundred pieces a season.",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80",
  },
];
