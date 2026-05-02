import { defineType, defineField } from "sanity";

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ Item",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      validation: (rule) => rule.required(),
    }),
  ],
});
