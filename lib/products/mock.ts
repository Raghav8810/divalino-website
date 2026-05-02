import type { Product } from "./types";
import { slugify } from "./slug";

/**
 * Mock product list. Replace with `sanityFetch(productsQuery)` in step 2.
 *
 * Images use Unsplash (already whitelisted in `next.config.ts`'s
 * `images.remotePatterns`) so `next/image` can optimise them out of the box.
 */
const RAW: Array<Omit<Product, "slug">> = [
  {
    id: "p01",
    name: "Silk Evening Gown",
    category: "Couture",
    season: "Spring '26",
    price: 4200,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p02",
    name: "Velvet Opera Cape",
    category: "Outerwear",
    season: "Winter '25",
    price: 3650,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p03",
    name: "Pearl Drop Slip",
    category: "Eveningwear",
    season: "Spring '26",
    price: 2890,
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p04",
    name: "Atelier Trench",
    category: "Outerwear",
    season: "Autumn '25",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p05",
    name: "Ivory Brocade Set",
    category: "Couture",
    season: "Spring '26",
    price: 5400,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p06",
    name: "Noir Tailored Suit",
    category: "Tailoring",
    season: "Winter '25",
    price: 3950,
    image:
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p07",
    name: "Marble Drape Dress",
    category: "Eveningwear",
    season: "Summer '26",
    price: 2750,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p08",
    name: "Gold Thread Kimono",
    category: "Couture",
    season: "Resort '26",
    price: 4800,
    image:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p09",
    name: "Crimson Maxi",
    category: "Eveningwear",
    season: "Winter '25",
    price: 2300,
    image:
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p10",
    name: "Linen Atelier Coat",
    category: "Outerwear",
    season: "Summer '26",
    price: 2950,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
  },
];

export const PRODUCTS: Product[] = RAW.map((p) => ({
  ...p,
  slug: slugify(p.name),
}));
