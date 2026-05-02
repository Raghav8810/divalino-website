import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemas";

export default defineConfig({
  basePath: "/studio",
  name: "default",
  title: "Learning Web Studio",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
