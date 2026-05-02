export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
};

export type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  coverImage?: SanityImage;
  publishedAt?: string;
  body?: unknown;
  author?: { name: string; picture?: SanityImage };
};
