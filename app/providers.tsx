"use client";

import type { ReactNode } from "react";
import { MotionProvider } from "@/components/animations/MotionProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionProvider>
  );
}
