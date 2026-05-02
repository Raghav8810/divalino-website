/**
 * Product data contract used across the app.
 *
 * This is the single source of truth — both the mock data file and the future
 * Sanity adapter will return objects shaped like this. Step 2 (detail page) +
 * Step 3 (related carousel) will both consume `Product` and `ProductDetail`.
 */

export type Product = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  season?: string;
  price?: number;
  /** Primary card image (used in gallery + carousel). */
  image: string;
};

/**
 * Extended shape used on the detail page. Keeping it as a separate type means
 * the gallery payload stays light — it doesn't need the description / sizes.
 */
export type ProductDetail = Product & {
  images: string[];
  description: string;
  fabric?: string;
  care?: string;
  sizes?: string[];
};
