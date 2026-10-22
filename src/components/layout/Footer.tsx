import { links, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-rust/40 bg-asphalt-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-plate/60 sm:flex-row sm:justify-between">
        <div className="space-y-1">
          <p>
            {site.name} {site.version}, por{" "}
            <a href={site.author.github} className="underline hover:text-plate">
              {site.author.name}
            </a>
            .
          </p>
          <p>Modpack, mods Lazarus, configs e scripts: todos os direitos reservados.</p>
          <p>Mods de terceiros pertencem aos seus autores e não são redistribuídos.</p>
        </div>
        <ul className="flex gap-4">
          <li>
            <a href={links.organization} className="hover:text-plate">
              GitHub
            </a>
          </li>
          <li>
            <a href={links.issues} className="hover:text-plate">
              Reportar bug
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
