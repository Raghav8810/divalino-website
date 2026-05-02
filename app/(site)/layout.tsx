import { Providers } from "../providers";
import { AnimatedNavbar } from "@/components/hero/AnimatedNavbar";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <AnimatedNavbar />
      <main className="flex-1">{children}</main>
    </Providers>
  );
}
