// // import { env } from "@/lib/utils/env";

// export function organizationJsonLd() {
//   return {
//     "@context": "https://schema.org",
//     "@type": "Organization",
//     name: env.siteName,
//     url: env.siteUrl,
//     logo: new URL("/logo.png", env.siteUrl).toString(),
//   };
// }

// export function websiteJsonLd() {
//   return {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     name: env.siteName,
//     url: env.siteUrl,
//     potentialAction: {
//       "@type": "SearchAction",
//       target: `${env.siteUrl}/search?q={search_term_string}`,
//       "query-input": "required name=search_term_string",
//     },
//   };
// }

// export function articleJsonLd(args: {
//   title: string;
//   description?: string;
//   slug: string;
//   publishedAt?: string;
//   updatedAt?: string;
//   authorName?: string;
//   image?: string;
// }) {
//   return {
//     "@context": "https://schema.org",
//     "@type": "Article",
//     headline: args.title,
//     description: args.description,
//     mainEntityOfPage: new URL(`/blog/${args.slug}`, env.siteUrl).toString(),
//     datePublished: args.publishedAt,
//     dateModified: args.updatedAt || args.publishedAt,
//     author: args.authorName
//       ? { "@type": "Person", name: args.authorName }
//       : undefined,
//     image: args.image,
//     publisher: {
//       "@type": "Organization",
//       name: env.siteName,
//       logo: {
//         "@type": "ImageObject",
//         url: new URL("/logo.png", env.siteUrl).toString(),
//       },
//     },
//   };
// }
