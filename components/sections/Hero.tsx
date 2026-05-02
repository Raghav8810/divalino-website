"use client";

import { m } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { fadeIn, stagger } from "@/lib/motion/variants";

export function Hero() {
  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <m.div
          className="max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <m.h1
            variants={fadeIn}
            className="font-display text-4xl font-bold tracking-tight md:text-6xl"
          >
            Learn, build, and ship{" "}
            <span className="text-[var(--color-brand-600)]">production-grade</span>{" "}
            web experiences.
          </m.h1>
          <m.p
            variants={fadeIn}
            className="mt-6 text-lg text-[var(--color-muted-foreground)]"
          >
            A Next.js 14+ starter with App Router, TypeScript, Tailwind v4,
            Framer Motion, GSAP, and Sanity CMS — SEO-ready out of the box.
          </m.p>
          <m.div variants={fadeIn} className="mt-8 flex gap-3">
            <Button size="lg">Get started</Button>
            <Button size="lg" variant="outline">
              Read the docs
            </Button>
          </m.div>
        </m.div>
      </Container>
    </section>
  );
}
