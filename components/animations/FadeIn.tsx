"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { fadeIn } from "@/lib/motion/variants";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, className }: Props) {
  return (
    <m.div
      className={className}
      variants={fadeIn}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </m.div>
  );
}
