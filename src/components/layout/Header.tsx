import Link from "next/link";
import { site } from "@/content/site";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rust/40 bg-asphalt/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-stencil text-xl tracking-wider text-plate">
          Project <span className="text-lazarus">Lazarus</span>
        </Link>
        {/* ponytail: <details> as the mobile menu, no JS state; swap for a client toggle if it needs animation */}
        <details className="group relative lg:hidden">
          <summary className="cursor-pointer list-none rounded border border-plate/30 px-3 py-1 text-sm text-plate">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded border border-rust/40 bg-asphalt p-3">
            <NavLinks className="flex flex-col gap-2" label="Navegação móvel" />
          </div>
        </details>
        <NavLinks className="hidden items-center gap-5 lg:flex" label="Navegação principal" />
        <Link
          href="/baixar"
          className="hidden rounded bg-lazarus px-4 py-2 text-sm font-semibold text-plate transition hover:bg-lazarus/85 sm:inline-block"
        >
          Baixar {site.version}
        </Link>
      </div>
    </header>
  );
}
