"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when viewport is below the given breakpoint (default 768px).
 * Used to swap the pinned horizontal gallery for a normal vertical grid on
 * touch / small screens — pinning + scrub feels bad on phones.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
