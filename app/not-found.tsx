import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-sm font-medium text-[var(--color-brand-600)]">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-[var(--color-muted-foreground)]">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-[var(--color-brand-600)] hover:underline"
      >
        ← Back home
      </Link>
    </Container>
  );
}
