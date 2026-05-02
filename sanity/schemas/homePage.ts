import { defineType, defineField } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  // Only allow a single instance of this document (enforced via studio structure or conventions)
  fields: [
    // --- Hero Section ---
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker Text", type: "string", initialValue: "SCROLL TO WALK" }),
        defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Step into the story." }),
        defineField({ name: "videoMp4", title: "Video (MP4)", type: "file", options: { accept: "video/mp4" } }),
        defineField({ name: "videoWebm", title: "Video (WebM)", type: "file", options: { accept: "video/webm" } }),
      ],
    }),

    // --- Gallery Section ---
    defineField({
      name: "gallery",
      title: "Featured Pieces",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", initialValue: "Spring '26 Collection" }),
        defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Featured Pieces" }),
        defineField({
          name: "products",
          title: "Products",
          type: "array",
          of: [{ type: "reference", to: [{ type: "product" }] }],
        }),
      ],
    }),

    // --- Explore Section ---
    defineField({
      name: "explore",
      title: "Explore Panels",
      type: "object",
      fields: [
        defineField({
          name: "panels",
          title: "Panels",
          type: "array",
          of: [{ type: "reference", to: [{ type: "explorePanel" }] }],
        }),
      ],
    }),

    // --- Journal Section ---
    defineField({
      name: "journal",
      title: "Journal / Blog",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string", initialValue: "THE JOURNAL" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "subheading", title: "Subheading", type: "text" }),
        defineField({
          name: "entries",
          title: "Journal Entries",
          type: "array",
          of: [{ type: "reference", to: [{ type: "journalEntry" }] }],
        }),
      ],
    }),

    // --- Marquee ---
    defineField({
      name: "marquee",
      title: "Marquee Phrases",
      type: "object",
      fields: [
        defineField({
          name: "phrases",
          title: "Phrases",
          type: "array",
          of: [{ type: "string" }],
        }),
      ],
    }),

    // --- Our Story ---
    defineField({
      name: "ourStory",
      title: "Our Story",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "manifesto", title: "Manifesto Text", type: "text" }),
        defineField({ name: "image", title: "Story Image", type: "image", options: { hotspot: true } }),
        defineField({
          name: "pillImages",
          title: "Inline Pill Images",
          type: "array",
          of: [{ type: "image", options: { hotspot: true } }],
        }),
        defineField({
          name: "stats",
          title: "Statistics",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "value", title: "Value", type: "string" }),
                defineField({ name: "label", title: "Label", type: "string" }),
              ],
            },
          ],
        }),
        defineField({
          name: "button",
          title: "Button",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Button Label", type: "string" }),
            defineField({ name: "href", title: "Button Link", type: "string" }),
          ],
        }),
      ],
    }),

    // --- Testimonials ---
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "object",
      fields: [
        defineField({
          name: "items",
          title: "Testimonials",
          type: "array",
          of: [{ type: "reference", to: [{ type: "testimonial" }] }],
        }),
      ],
    }),

    // --- FAQ ---
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({
          name: "items",
          title: "Questions",
          type: "array",
          of: [{ type: "reference", to: [{ type: "faqItem" }] }],
        }),
      ],
    }),

    // --- Footer ---
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({ name: "tagline", title: "Footer Tagline", type: "string" }),
        defineField({ name: "heading", title: "Footer Heading", type: "string" }),
        defineField({ name: "newsletterText", title: "Newsletter Description", type: "text" }),
        defineField({
          name: "navColumns",
          title: "Navigation Columns",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "label", title: "Column Title", type: "string" }),
                defineField({
                  name: "links",
                  title: "Links",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      fields: [
                        defineField({ name: "label", title: "Link Label", type: "string" }),
                        defineField({ name: "href", title: "URL", type: "string" }),
                      ],
                    },
                  ],
                }),
              ],
            },
          ],
        }),
        defineField({ name: "copyright", title: "Copyright Text", type: "string" }),
      ],
    }),
  ],

  preview: {
    prepare() {
      return { title: "Home Page" };
    },
  },
});
