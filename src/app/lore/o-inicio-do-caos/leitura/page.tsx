import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActNav } from "@/components/lore/ActNav";
import { CityLights, GangTags, TriageSheet } from "@/components/lore/Artifacts";
import { CancelaVersions } from "@/components/lore/CancelaVersions";
import { EmergencyRadio } from "@/components/lore/EmergencyRadio";
import { RoadChoice } from "@/components/lore/RoadChoice";
import { ThreeWays } from "@/components/lore/ThreeWays";
import { type Act, dayOne, inicioDoCaos } from "@/content/lore";
import { site } from "@/content/site";

// Letra da enfermeira: só as anotações do caderno usam.
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${inicioDoCaos.title} (modo leitura)`,
  description: "A lore do Project Lazarus em 5 atos: o que aconteceu com a cidade antes do seu Dia 1.",
};

/** O documento de cada ato (entre as cenas e a citação) e o fecho do Ato V. */
const artifacts: Record<string, ReactNode> = {
  "ato-1": <TriageSheet />,
  "ato-2": (
    <div className="space-y-6">
      <EmergencyRadio />
      <CityLights />
    </div>
  ),
  "ato-3": <ThreeWays />,
  "ato-4": <CancelaVersions />,
  "ato-5": <GangTags />,
};
const endings: Record<string, ReactNode> = { "ato-5": <RoadChoice /> };

function ActSection({ act, index }: { act: Act; index: number }) {
  return (
    <section
      id={act.id}
      aria-labelledby={`${act.id}-titulo`}
      className="relative scroll-mt-28"
      // A noite cai de ato em ato.
      style={{ backgroundColor: `rgb(5 7 13 / ${0.15 + index * 0.13})` }}
    >
      <div className="relative">
        <Image
          src={act.image}
          alt=""
          width={1600}
          height={900}
          sizes="100vw"
          priority={index === 0}
          className="h-[46vh] min-h-64 w-full object-cover sm:h-[62vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-asphalt-deep/30 via-transparent to-asphalt-deep" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6">
          <h2 id={`${act.id}-titulo`} className="font-stencil leading-none">
            <span className="block text-sm tracking-[0.4em] text-sunset uppercase">Ato {act.numeral}</span>
            <span className="mt-2 block text-4xl text-plate sm:text-6xl">{act.title}</span>
          </h2>
          <p className="mt-2 font-mono text-xs tracking-widest text-plate/60 uppercase">{act.when}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 overflow-x-clip px-4 py-14 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="max-w-[min(100%,48rem)] space-y-10">
          {act.scenes.map((scene) => (
            <p key={scene} className="reveal text-lg leading-relaxed text-plate/90 sm:text-xl">
              {scene}
            </p>
          ))}

          <div className="reveal">{artifacts[act.id]}</div>

          <blockquote className="reveal border-l-4 border-lazarus pl-5 font-stencil text-3xl leading-tight text-plate sm:text-4xl">
            {act.quote}
          </blockquote>

          {act.after.map((scene) => (
            <p key={scene} className="reveal text-lg leading-relaxed text-plate/80">
              {scene}
            </p>
          ))}

          {endings[act.id] && <div className="reveal">{endings[act.id]}</div>}

          <p className="reveal flex gap-3 rounded border border-dashed border-plate/20 p-4 text-sm text-plate/60">
            <span className="font-mono text-xs tracking-widest whitespace-nowrap text-sunset uppercase">
              Rastro no mundo
            </span>
            {act.trace}
          </p>
        </div>

        {/* Anotação da enfermeira na margem do caderno. */}
        <aside className="lg:pt-6">
          <p className="reveal rotate-[-3deg] font-hand text-3xl leading-tight text-sunset lg:sticky lg:top-40">
            {act.note}
          </p>
        </aside>
      </div>
    </section>
  );
}

export default function StoryPage() {
  const { acts } = inicioDoCaos;
  return (
    <article className={hand.variable}>
      {/* Barra de leitura do blog: esvazia como stamina. */}
      <div aria-hidden className="read-progress fixed inset-x-0 top-0 z-50 h-1" />

      <header className="mx-auto max-w-6xl px-4 pt-12 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/lore" className="text-sm text-plate/60 hover:text-plate">
            ← Lore
          </Link>
          <Link
            href="/lore/o-inicio-do-caos"
            className="rounded border border-sunset/60 px-3 py-1.5 text-sm text-sunset hover:bg-sunset/10"
          >
            Jogar esta história ▸
          </Link>
        </div>
        <p className="mt-6 font-mono text-xs tracking-[0.3em] text-sunset uppercase">Arquivo 01 · Caderno de triagem</p>
        <h1 className="mt-2 font-stencil text-5xl leading-none text-plate sm:text-7xl">{inicioDoCaos.title}</h1>
        <p className="mt-6 max-w-[min(100%,42rem)] text-lg text-plate/80">{inicioDoCaos.intro}</p>
      </header>

      <ActNav acts={acts} />

      {acts.map((act, i) => (
        <ActSection key={act.id} act={act} index={i} />
      ))}

      <section aria-labelledby="seu-dia-1" className="relative overflow-hidden bg-[#05070d] px-4 py-24 text-center">
        <p className="mx-auto max-w-xl font-mono text-sm text-radio">
          <span className="text-radio/60">[RÁDIO] </span>
          {dayOne.radio}
        </p>

        <div className="lore-paper relative mx-auto mt-12 max-w-lg rounded-sm px-6 py-14 text-asphalt-deep shadow-2xl">
          <p className="font-hand text-2xl text-asphalt-deep/50">próxima página do caderno</p>
          <h2
            id="seu-dia-1"
            className="lore-stamp mx-auto mt-4 inline-block rotate-[-4deg] rounded-sm border-[6px] border-lazarus px-6 py-2 font-stencil text-5xl whitespace-nowrap text-lazarus uppercase sm:text-7xl"
          >
            Seu Dia 1
          </h2>
          <p className="mt-6 text-lg">{dayOne.closing}</p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/baixar"
            className="rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
          >
            Baixar e começar · {site.version}
          </Link>
          <Link
            href="/"
            className="rounded border border-plate/30 px-6 py-4 text-plate hover:border-sunset hover:text-sunset"
          >
            Jogar o Dia 0 no site
          </Link>
        </div>
      </section>
    </article>
  );
}
