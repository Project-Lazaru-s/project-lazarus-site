import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { archive } from "@/content/lore";

export const metadata: Metadata = {
  title: "Lore",
  description: "Os arquivos do mundo do Project Lazarus: o que aconteceu antes do seu Dia 1.",
};

export default function LorePage() {
  return (
    <>
      <PageHeader title="Lore">
        <p>
          Fichas, mapas, rádios e cadernos recuperados da cidade. Cada arquivo conta uma parte do que aconteceu antes de
          você chegar.
        </p>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {archive.map((entry, i) =>
          entry.sealed ? (
            <article
              key={entry.code}
              aria-label={`${entry.code}: lacrado`}
              className="reveal relative flex min-h-72 flex-col justify-between overflow-hidden rounded border border-dashed border-plate/20 bg-asphalt-deep p-6 text-plate/40"
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase">{entry.code}</p>
              {/* Título tarjado: o arquivo existe, o conteúdo ainda não foi recuperado. */}
              <div aria-hidden className="space-y-2">
                <span className="block h-6 w-3/4 bg-plate/15" />
                <span className="block h-3 w-full bg-plate/10" />
                <span className="block h-3 w-2/3 bg-plate/10" />
              </div>
              <p className="lore-sealed self-start rounded-sm border-2 border-lazarus/60 px-3 py-1 font-stencil text-lg tracking-widest text-lazarus/70 uppercase">
                Lacrado
              </p>
            </article>
          ) : (
            <article
              key={entry.slug}
              className={`reveal group relative overflow-hidden rounded border border-rust/40 bg-asphalt transition hover:border-sunset ${
                i === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="overflow-hidden">
                <Image
                  src={entry.cover}
                  alt=""
                  width={1600}
                  height={900}
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="aspect-[16/9] object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">
                  {entry.code} · {entry.meta}
                </p>
                <h2 className="mt-2 font-stencil text-3xl">
                  <Link
                    href={`/lore/${entry.slug}`}
                    className="text-plate after:absolute after:inset-0 group-hover:text-sunset"
                  >
                    {entry.title}
                  </Link>
                </h2>
                <p className="mt-2 text-plate/75">{entry.summary}</p>
                <p className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <span className="rounded bg-lazarus px-4 py-2 font-semibold text-plate">Jogar ▸</span>
                  {/* Acima do link do card inteiro (after:inset-0), para ser clicável. */}
                  <Link
                    href={`/lore/${entry.slug}/leitura`}
                    className="relative z-10 text-plate/60 underline hover:text-plate"
                  >
                    ou ler sem jogar ({entry.minutes} min)
                  </Link>
                </p>
              </div>
            </article>
          ),
        )}
      </section>
    </>
  );
}
