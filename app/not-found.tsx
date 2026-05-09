import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-sm font-medium text-[var(--color-brand-600)]">Coming Soon</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
        Under Construction 🚧
      </h1>
      <p className="mt-4 text-[var(--color-muted-foreground)]">
        We are working hard to bring you something amazing. We will update this soon! ✨
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
