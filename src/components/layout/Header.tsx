import Link from "next/link";
import { site } from "@/content/site";
import { MobileMenu } from "./MobileMenu";
import { DesktopNav } from "./NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rust/40 bg-asphalt/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-stencil text-xl tracking-wider whitespace-nowrap text-plate">
          Project <span className="text-lazarus">Lazarus</span>
        </Link>
        <MobileMenu />
        <DesktopNav className="ml-auto hidden whitespace-nowrap lg:block" />
        <Link
          href="/baixar"
          className="ml-6 hidden rounded bg-lazarus px-4 py-2 text-sm font-semibold whitespace-nowrap text-plate transition hover:bg-lazarus/85 sm:inline-block"
        >
          Baixar {site.version}
        </Link>
      </div>
    </header>
  );
}
