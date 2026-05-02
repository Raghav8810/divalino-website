export type SanityHomePageData = {
  hero?: {
    kicker?: string;
    heading?: string;
    videoMp4Url?: string;
    videoWebmUrl?: string;
  };
  gallery?: {
    eyebrow?: string;
    heading?: string;
    products?: Array<{
      id: string;
      name: string;
      slug: string;
      category?: string;
      season?: string;
      price?: number;
      image: string;
    }>;
  };
  explore?: {
    panels?: Array<{
      id: string;
      eyebrow?: string;
      heading: string;
      body?: string;
      image: string;
    }>;
  };
  journal?: {
    eyebrow?: string;
    heading?: string;
    subheading?: string;
    entries?: Array<{
      id: string;
      title: string;
      description?: string;
      image: string;
    }>;
  };
  marquee?: {
    phrases?: string[];
  };
  ourStory?: {
    eyebrow?: string;
    heading?: string;
    manifesto?: string;
    image?: string;
    pillImages?: string[];
    stats?: Array<{
      value: string;
      label: string;
    }>;
    button?: {
      label?: string;
      href?: string;
    };
  };
  testimonials?: {
    items?: Array<{
      id: string;
      quote: string;
      name: string;
      title?: string;
      avatar?: string;
    }>;
  };
  faq?: {
    eyebrow?: string;
    heading?: string;
    items?: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
  footer?: {
    tagline?: string;
    heading?: string;
    newsletterText?: string;
    navColumns?: Array<{
      label: string;
      links: Array<{
        label: string;
        href: string;
      }>;
    }>;
    copyright?: string;
  };
};
