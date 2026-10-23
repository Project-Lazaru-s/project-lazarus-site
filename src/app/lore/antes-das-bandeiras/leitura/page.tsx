import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { LorePhoto } from "@/components/lore/LorePhoto";
import { type Line, lineText } from "@/content/lore";
import { type Dossier, dossiers, origins } from "@/content/origins";

const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${origins.title} (modo leitura)`,
  description: "Como Haven, Rovers, Wardens e Military começaram durante o colapso, antes do seu Dia 1.",
};

function Scene({ line, className }: { line: Line; className: string }) {
  return (
    <div className="reveal space-y-4">
      <p className={`text-lg leading-relaxed ${className}`}>{lineText(line)}</p>
      {typeof line !== "string" && (
        <Image
          src={line.image}
          alt={line.alt}
          width={1672}
          height={941}
          sizes="(min-width: 768px) 48rem, 100vw"
          className="rounded border border-plate/15"
        />
      )}
    </div>
  );
}

function DossierSection({ dossier, index }: { dossier: Dossier; index: number }) {
  return (
    <section id={dossier.id} aria-labelledby={`${dossier.id}-titulo`} className="scroll-mt-28 px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-6">
          <LorePhoto
            src={dossier.photo}
            name={dossier.name}
            focus={dossier.focus}
            tilt={index % 2 ? 2 : -2.5}
            className="w-40 shrink-0"
          />
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">Dossiê nº 0{index + 1}</p>
            <h2 id={`${dossier.id}-titulo`} className="font-stencil text-5xl leading-none text-plate">
              {dossier.name}
            </h2>
            <p className="mt-1 text-plate/70">
              {dossier.title} · <span className="text-plate/50">{dossier.need}</span>
            </p>
          </div>
        </div>

        {dossier.parts.length === 0 ? (
          <p className="mt-8 inline-block -rotate-2 rounded-sm border-4 border-plate/30 px-4 py-1 font-stencil text-xl tracking-widest text-plate/50 uppercase">
            Pasta em recuperação
          </p>
        ) : (
          <div className="mt-10 space-y-16">
            {dossier.parts.map((part) => (
              <div key={part.id} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
                <div className="max-w-[min(100%,48rem)] space-y-8">
                  <h3 className="font-stencil leading-none">
                    <span className="block text-sm tracking-[0.4em] text-sunset uppercase">Parte {part.numeral}</span>
                    <span className="mt-2 block text-3xl text-plate sm:text-4xl">{part.title}</span>
                    <span className="mt-2 block font-mono text-xs tracking-widest text-plate/60 uppercase">
                      {part.when}
                    </span>
                  </h3>
                  {part.scenes.map((l) => (
                    <Scene key={lineText(l)} line={l} className="text-plate/90 sm:text-xl" />
                  ))}
                  <blockquote className="reveal border-l-4 border-lazarus pl-5 font-stencil text-3xl leading-tight text-plate">
                    {part.quote}
                  </blockquote>
                  {part.after.map((l) => (
                    <Scene key={lineText(l)} line={l} className="text-plate/80" />
                  ))}
                </div>
                <aside className="lg:pt-6">
                  <p className="reveal rotate-[-3deg] font-hand text-3xl leading-tight text-sunset">{part.note}</p>
                </aside>
              </div>
            ))}
            {dossier.trace && (
              <p className="reveal flex max-w-3xl flex-col gap-1 sm:flex-row sm:gap-3 rounded border border-dashed border-plate/20 p-4 text-sm text-plate/60">
                <span className="font-mono text-xs tracking-widest text-sunset uppercase">{dossier.trace.title}</span>
                {dossier.trace.text}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function OriginsReadingPage() {
  return (
    <article className={hand.variable}>
      <div aria-hidden className="read-progress fixed inset-x-0 top-0 z-50 h-1" />
      <header className="mx-auto max-w-6xl px-4 pt-12 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/lore" className="text-sm text-plate/60 hover:text-plate">
            ← Lore
          </Link>
          <Link
            href={`/lore/${origins.slug}`}
            className="rounded border border-sunset/60 px-3 py-1.5 text-sm text-sunset hover:bg-sunset/10"
          >
            Jogar esta história ▸
          </Link>
        </div>
        <p className="mt-6 font-mono text-xs tracking-[0.3em] text-sunset uppercase">Arquivo 02 · Dossiês de origem</p>
        <h1 className="mt-2 font-stencil text-5xl leading-none text-plate sm:text-7xl">{origins.title}</h1>
        <p className="mt-6 max-w-[min(100%,42rem)] text-lg text-plate/80">{origins.intro}</p>
        <nav aria-label="Dossiês" className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
          {dossiers.map((d) => (
            <a key={d.id} href={`#${d.id}`} className="rounded border border-plate/20 px-3 py-1.5 hover:border-sunset">
              {d.name}
            </a>
          ))}
        </nav>
      </header>
      {dossiers.map((d, i) => (
        <DossierSection key={d.id} dossier={d} index={i} />
      ))}
    </article>
  );
}
