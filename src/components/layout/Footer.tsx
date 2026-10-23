import Link from "next/link";
import { authors, links, navGroups, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-rust/40 bg-asphalt-deep">
      <nav
        aria-label="Mapa do site"
        className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 pt-10 pb-2 text-sm sm:grid-cols-4"
      >
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="font-mono text-[11px] tracking-[0.25em] text-plate/40 uppercase">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.items.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-plate/65 hover:text-plate">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-plate/40 uppercase">Jogar</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/baixar" className="text-plate/65 hover:text-plate">
                Baixar {site.version}
              </Link>
            </li>
            <li>
              <a href={links.organization} className="text-plate/65 hover:text-plate">
                GitHub
              </a>
            </li>
            <li>
              <a href={links.issues} className="text-plate/65 hover:text-plate">
                Reportar bug
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-plate/50">
        <div className="space-y-1">
          <p>
            {site.name} {site.version}, por{" "}
            {authors.map((author, i) => (
              <span key={author.name}>
                {i > 0 && " e "}
                <a href={author.url} className="underline hover:text-plate">
                  {author.name}
                </a>
              </span>
            ))}
            .
          </p>
          <p>Modpack, mods Lazarus, configs e scripts: todos os direitos reservados.</p>
          <p>Mods de terceiros pertencem aos seus autores e não são redistribuídos.</p>
        </div>
      </div>
    </footer>
  );
}
