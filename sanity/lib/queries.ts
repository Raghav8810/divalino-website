import { groq } from "next-sanity";

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt,
    "author": author->{name, picture}
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt,
    body,
    "author": author->{name, picture}
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

export const homePageQuery = groq`
  *[_type == "homePage"][0] {
    hero {
      kicker,
      heading,
      "videoMp4Url": videoMp4.asset->url,
      "videoWebmUrl": videoWebm.asset->url
    },
    gallery {
      eyebrow,
      heading,
      "products": products[]->{
        "id": _id,
        name,
        "slug": slug.current,
        category,
        season,
        price,
        "image": image.asset->url
      }
    },
    explore {
      "panels": panels[]->{
        "id": _id,
        eyebrow,
        heading,
        body,
        "image": image.asset->url
      }
    },
    journal {
      eyebrow,
      heading,
      subheading,
      "entries": entries[]->{
        "id": _id,
        title,
        description,
        "image": image.asset->url
      }
    },
    marquee {
      phrases
    },
    ourStory {
      eyebrow,
      heading,
      manifesto,
      "image": image.asset->url,
      "pillImages": pillImages[].asset->url,
      stats[] {
        value,
        label
      },
      button {
        label,
        href
      }
    },
    testimonials {
      "items": items[]->{
        "id": _id,
        quote,
        name,
        title,
        "avatar": avatar.asset->url
      }
    },
    faq {
      eyebrow,
      heading,
      "items": items[]->{
        "id": _id,
        question,
        answer
      }
    },
    footer {
      tagline,
      heading,
      newsletterText,
      navColumns[] {
        label,
        links[] {
          label,
          href
        }
      },
      copyright
    }
  }
`;
