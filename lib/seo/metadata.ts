import type { Metadata } from "next";
import { env } from "@/lib/utils/env";

type BuildMetadata = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

const DEFAULT_TITLE = `${env.siteName} — Learn, build, ship.`;
const DEFAULT_DESCRIPTION =
  "A production-ready learning platform built with Next.js, Sanity, and a modern design system.";

/**
 * Build consistent page metadata using the Next.js Metadata API.
 */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = "/og.png",
  noIndex = false,
  keywords,
}: BuildMetadata = {}): Metadata {
  const url = new URL(path, env.siteUrl).toString();
  const resolvedTitle = title
    ? `${title} · ${env.siteName}`
    : DEFAULT_TITLE;

  return {
    metadataBase: new URL(env.siteUrl),
    title: resolvedTitle,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: env.siteName,
      title: resolvedTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: resolvedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [image],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
