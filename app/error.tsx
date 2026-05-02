"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="font-display text-3xl font-bold md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 text-[var(--color-muted-foreground)]">
        An unexpected error occurred. Please try again.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
