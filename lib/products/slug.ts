/**
 * Slugify any human string into a URL-safe slug.
 *
 *   "Silk Evening Gown"  →  "silk-evening-gown"
 *   "Côte d'Azur — Spring '26"  →  "cote-d-azur-spring-26"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
