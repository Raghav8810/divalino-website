import Link from "next/link";
import { Container } from "@/components/ui/Container";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold">
          Learning Web
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
