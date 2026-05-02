import type { SchemaTypeDefinition } from "sanity";
import { post } from "./post";
import { author } from "./author";
import { homePage } from "./homePage";
import { product } from "./product";
import { explorePanel } from "./explorePanel";
import { journalEntry } from "./journalEntry";
import { testimonial } from "./testimonial";
import { faqItem } from "./faqItem";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  author,
  homePage,
  product,
  explorePanel,
  journalEntry,
  testimonial,
  faqItem,
];
