import type { Metadata } from "next";
import { ScrollHero } from "@/components/hero/ScrollHero";
import { HorizontalGallery } from "@/components/gallery/HorizontalGallery";
import { ExploreSection } from "@/components/explore/ExploreSection";
import { JournalGrid } from "@/components/journal/JournalGrid";
import { Marquee } from "@/components/marquee/Marquee";
import { OurStory } from "@/components/story/OurStory";
import { TestimonialMarquee } from "@/components/testimonials/TestimonialMarquee";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/footer/Footer";
import { PRODUCTS } from "@/lib/products/mock";
import { EXPLORE_PANELS } from "@/lib/explore/mock";
import { JOURNAL_ENTRIES } from "@/lib/journal/mock";
import { TESTIMONIALS } from "@/lib/testimonials/mock";
import { FAQS } from "@/lib/faq/mock";
import { buildMetadata } from "@/lib/seo/metadata";

import { sanityFetch } from "@/sanity/lib/client";
import { homePageQuery } from "@/sanity/lib/queries";
import type { SanityHomePageData } from "@/sanity/lib/types";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description:
    "A production-ready Next.js starter with Sanity, Tailwind, Framer Motion & GSAP.",
  path: "/",
});

export default async function HomePage() {
  const data = await sanityFetch<SanityHomePageData>({
    query: homePageQuery,
    tags: ["homePage"],
  }).catch(() => null); // Graceful fallback if Sanity is unreachable

  console.log("Hero Data :", data)

  return (
    <>
      <ScrollHero
        kicker={data?.hero?.kicker}
        heading={data?.hero?.heading}
        videoMp4={data?.hero?.videoMp4Url}
        videoWebm={data?.hero?.videoWebmUrl}
      />
      <HorizontalGallery
        products={data?.gallery?.products ?? PRODUCTS}
        eyebrow={data?.gallery?.eyebrow ?? "Spring '26 Collection"}
        heading={data?.gallery?.heading ?? "Featured Pieces"}
      />
      <ExploreSection panels={data?.explore?.panels ?? EXPLORE_PANELS} />
      <JournalGrid entries={data?.journal?.entries ?? JOURNAL_ENTRIES} />
      <Marquee
        items={data?.marquee?.phrases ? data?.marquee?.phrases : []}
      />
      <OurStory
        eyebrow={data?.ourStory?.eyebrow}
        heading={data?.ourStory?.heading}
        manifesto={data?.ourStory?.manifesto}
        image={data?.ourStory?.image}
        pillImages={data?.ourStory?.pillImages}
        stats={data?.ourStory?.stats}
        button={data?.ourStory?.button}
      />
      <TestimonialMarquee testimonials={data?.testimonials?.items ?? TESTIMONIALS} />
      <FaqSection items={data?.faq?.items ?? FAQS} />
      <ContactSection />
      <Footer
        tagline={data?.footer?.tagline}
        heading={data?.footer?.heading}
        newsletterText={data?.footer?.newsletterText}
        copyright={data?.footer?.copyright}
        navColumns={data?.footer?.navColumns}
      />
    </>
  );
}
