/**
 * Runtime-safe environment accessor. Throws loudly in dev, falls back in prod.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Missing required env var: ${name}`);
    }
    return "";
  }
  return value;
}

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Learning Web",
  sanity: {
    projectId: required(
      "NEXT_PUBLIC_SANITY_PROJECT_ID",
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    ),
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01",
    readToken: process.env.SANITY_API_READ_TOKEN,
    revalidateSecret: process.env.SANITY_REVALIDATE_SECRET,
  },
} as const;
