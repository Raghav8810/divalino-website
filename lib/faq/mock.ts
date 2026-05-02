/**
 * Frequently asked questions surfaced on the home page.
 *
 * Questions are pitched as a discerning client would phrase them — about
 * craft, sourcing, sizing, returns, and care — so the section reads as
 * editorial Q&A rather than a customer-support FAQ.
 */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQS: FaqItem[] = [
  {
    id: "materials",
    question: "Where do your fabrics come from?",
    answer:
      "Our cloth is sourced from a small group of mills we visit personally — Italian silk from Como, hand-loomed wool from a 200-year-old Yorkshire mill, organic Japanese cotton from Okayama. We choose materials by hand, not by spec sheet, and every season we travel back to the loom to make sure the cloth still meets our standard.",
  },
  {
    id: "made-where",
    question: "Where are your pieces made?",
    answer:
      "Every garment is cut, sewn, and finished in our own atelier in Como, Italy. A small team of cutters and tailors work under one roof, making fewer than three hundred pieces a season. Slow on purpose. We don't outsource, and we never produce off-shore.",
  },
  {
    id: "sizing",
    question: "How should I think about sizing?",
    answer:
      "Our cuts run true to a relaxed European fit. If you're between sizes, we recommend sizing down for tailored silhouettes (suiting, tailored coats) and sizing up for relaxed pieces (knits, slip dresses). Each product page lists exact garment measurements, and our team is happy to walk you through fit personally — just write to us.",
  },
  {
    id: "returns",
    question: "What is your return policy?",
    answer:
      "Unworn pieces with original tags can be returned within 30 days of delivery for a full refund or exchange. Made-to-order and altered garments are final sale. We cover return shipping anywhere in Europe; international returns are at cost. If something doesn't feel right when it arrives, write to us first — we'll make it work.",
  },
  {
    id: "care",
    question: "How do I care for my piece?",
    answer:
      "Most of our garments are made to be worn often and washed rarely. Air them between wears, spot-clean where possible, and dry-clean only when needed. Each piece ships with a personalised care card, and we offer complimentary repairs and minor alterations for the lifetime of the garment — bring it back to us instead of replacing it.",
  },
  {
    id: "sustainability",
    question: "What does sustainability mean to you?",
    answer:
      "It means making fewer, better things — and standing behind them. We pay every artisan a living wage, source materials from mills with transparent supply chains, and design every piece to last a decade or more. We don't claim to be perfect; we publish our annual atelier report each March so you can hold us to the work.",
  },
];
