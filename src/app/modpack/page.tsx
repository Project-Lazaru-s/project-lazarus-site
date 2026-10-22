import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMod } from "@/content/mods";
import { requirements } from "@/content/site";
import { skillTrees, systems } from "@/content/systems";

export const metadata: Metadata = {
  title: "O modpack",
  description: "Infectados, furtividade, sobrevivência, moodles, facções, eventos, mundo e habilidades.",
};

export default function ModpackPage() {
  return (
    <>
      <PageHeader title="O modpack">
        <p>
          Você começa numa cidade em ruínas, com pouco saque e muitos infectados. Precisa comer, beber água limpa, se
          esconder, negociar com facções humanas e evoluir habilidades.
        </p>
      </PageHeader>

      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-12 sm:grid-cols-4">
        {requirements.map(({ label, value }) => (
          <div key={label} className="rounded border border-rust/40 bg-asphalt p-4">
            <dt className="text-xs tracking-widest text-plate/50 uppercase">{label}</dt>
            <dd className="mt-1 text-plate">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[11rem_1fr]">
        {/* Índice lateral no estilo das frequências do rádio. */}
        <nav aria-label="Sistemas" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1 border-l border-radio/30 font-mono text-sm">
            {systems.map((system, i) => (
              <li key={system.id}>
                <a href={`#${system.id}`} className="group flex gap-2 py-1 pl-3 text-plate/60 hover:text-radio">
                  <span aria-hidden className="text-radio/50 group-hover:text-radio">
                    {(88.1 + i * 1.6).toFixed(1)}
                  </span>
                  {system.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-2">
          {systems.map((system) => {
            const mod = system.mod ? getMod(system.mod) : undefined;
            return (
              <section
                key={system.id}
                id={system.id}
                aria-labelledby={`sistema-${system.id}`}
                className="reveal scroll-mt-24 rounded border border-rust/40 bg-asphalt p-6"
              >
                <h2 id={`sistema-${system.id}`} className="flex items-center gap-3 font-stencil text-2xl text-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element -- sprite minúsculo em pixel art */}
                  <img src={system.icon} alt="" className="h-9 w-9 object-contain pixelated" />
                  {system.title}
                </h2>
                <ul className="mt-3 list-[square] space-y-1.5 pl-5 text-plate/80">
                  {system.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {mod && (
                  <Link href={`/mods/${mod.slug}`} className="mt-4 inline-block text-sm text-sunset hover:underline">
                    {mod.name} →
                  </Link>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="habilidades" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="habilidades" className="font-stencil text-3xl text-plate">
          Habilidades
        </h2>
        <p className="mt-2 text-plate/70">Manuais encontrados no saque dobram o XP de uma árvore por um tempo.</p>
        <table className="mt-6 w-full text-left text-sm">
          <caption className="sr-only">Árvores de habilidades</caption>
          <thead className="text-plate/50">
            <tr>
              <th className="py-2 pr-4 font-normal">Árvore</th>
              <th className="py-2 font-normal">Ideia</th>
            </tr>
          </thead>
          <tbody>
            {skillTrees.map((tree) => (
              <tr key={tree.name} className="border-t border-rust/30 align-top">
                <th className="py-3 pr-4 font-semibold text-sunset">{tree.name}</th>
                <td className="py-3 text-plate/80">{tree.idea}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
