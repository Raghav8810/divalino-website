"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Wraps the app with Framer Motion configuration and lazy-loaded DOM features
 * to keep initial JS payload small.
 */
export function MotionProvider({ children }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
