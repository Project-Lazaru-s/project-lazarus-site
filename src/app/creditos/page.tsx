import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { thirdPartyMods } from "@/content/credits";
import { authors, links } from "@/content/site";

export const metadata: Metadata = {
  title: "Créditos",
  description: "Quem fez o Project Lazarus e os mods de terceiros que ele usa.",
};

export default function CreditsPage() {
  return (
    <>
      <PageHeader title="Créditos">
        <p>O Project Lazarus é construído em cima do trabalho de muita gente.</p>
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pb-20">
        <section aria-labelledby="autores">
          <h2 id="autores" className="font-stencil text-3xl text-plate">
            Autores
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {authors.map((person) => (
              <li key={person.name} className="rounded border border-rust/40 bg-asphalt p-5">
                <a href={person.url} className="font-stencil text-xl text-lazarus hover:underline">
                  {person.name}
                </a>
                <p className="mt-1 text-sm text-plate/70">{person.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="terceiros">
          <h2 id="terceiros" className="font-stencil text-3xl text-plate">
            Mods de terceiros
          </h2>
          <p className="mt-2 max-w-3xl text-plate/70">
            Os principais mods do pack. Todos pertencem aos seus autores e não são redistribuídos aqui. A{" "}
            <a href={links.modsList} className="text-sunset underline">
              lista completa, com links e autores
            </a>
            , está no repositório.
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {thirdPartyMods.map(({ group, mods }) => (
              <div key={group}>
                <h3 className="text-sm tracking-widest text-sunset uppercase">{group}</h3>
                <ul className="mt-2 space-y-1 text-plate/80">
                  {mods.map((mod) => (
                    <li key={mod}>{mod}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
