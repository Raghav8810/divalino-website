/**
 * Customer testimonials surfaced in the home page's two-row marquee.
 *
 * Names + titles are intentionally fashion-press flavoured (editor,
 * stylist, designer, etc.) so the section reads as industry endorsement
 * rather than e-commerce reviews.
 */

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  title?: string;
  /** Avatar — Unsplash portraits, neutral atelier mood. */
  avatar?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "amelia",
    quote:
      "These pieces don't just look beautiful — they age beautifully. The silk slip I bought two seasons ago feels even better now than the day it arrived.",
    name: "Amelia Cortés",
    title: "Senior Editor, Mode Quarterly",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "henry",
    quote:
      "What sets this house apart is the obsession. Every seam, every button, every stitch — chosen with intent. It's the slow fashion the industry keeps talking about, finally done right.",
    name: "Henry Ashford",
    title: "Stylist & Creative Director",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "naomi",
    quote:
      "The atelier trench is the most thoughtful coat I've owned in a decade. The Italian wool is extraordinary, and the cut moves with you instead of against you.",
    name: "Naomi Fields",
    title: "Founder, Field & Loom",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "ravi",
    quote:
      "I've stopped buying anything I can't picture wearing in ten years. Their collections make that promise feel believable. Quietly modern, never trend-chasing.",
    name: "Ravi Mehta",
    title: "Architect & Long-time Client",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "ines",
    quote:
      "The hand-rolled hems, the horn buttons, the lining you only notice when you reach inside the pocket — this is craft that respects the wearer.",
    name: "Inès Laurent",
    title: "Fashion Buyer, Maison Lumen",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "thomas",
    quote:
      "Working with the atelier on a custom piece was the closest I've come to true bespoke at this price point. They listened, sketched, and delivered exactly the suit I dreamed of.",
    name: "Thomas Becker",
    title: "Concert Pianist",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "sofia",
    quote:
      "The crimson maxi was the most-asked-about dress on the carpet last month. Cut, drape, colour — every element does exactly what it should.",
    name: "Sofia Andresen",
    title: "Costume Designer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "marco",
    quote:
      "I work with most of the storied houses in Milan and Paris. This atelier holds its own — the make is honest, the materials are uncompromising, and the team actually cares.",
    name: "Marco Visentin",
    title: "Tailor, Visentin & Sons",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
  },
];
