import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "@/sanity/env";

export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

export const previewClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
  perspective: "previewDrafts",
});

/**
 * Fetch data from Sanity with Next.js caching + tag-based revalidation.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 60,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate, tags },
  });
}
