import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HordeGame } from "@/components/games/HordeGame";
import { StealthGame } from "@/components/games/StealthGame";
import { Radio } from "@/components/radio/Radio";
import { DaySection } from "@/components/survival/DaySection";
import { Dossier } from "@/components/survival/Dossier";
import { ConnectedAtmosphere, ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import { highlights, slogans } from "@/content/home";
import { site } from "@/content/site";

function Chapter({ day, title, children }: { day: number; title: string; children: ReactNode }) {
  return (
    <header className="max-w-2xl">
      <p className="font-mono text-sm tracking-[0.3em] text-sunset uppercase">Dia {day}</p>
      <h2 className="mt-2 font-stencil text-4xl text-plate sm:text-5xl">{title}</h2>
      <div className="mt-3 text-plate/75">{children}</div>
    </header>
  );
}

export default function HomePage() {
  return (
    <SurvivalProvider>
      <ConnectedAtmosphere />
      <ConnectedHud />

      <DaySection day={0} aria-label="Apresentação" className="relative isolate overflow-hidden">
        <Image
          src="/images/banners/modpack.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[30%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt-deep via-asphalt-deep/85 to-asphalt-deep/20" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-36">
          <p className="text-sm tracking-[0.3em] text-sunset uppercase">
            Minecraft 1.20.1 · Forge · Versão {site.version}
          </p>
          <h1 className="mt-4 font-stencil text-6xl leading-none text-plate sm:text-8xl">
            Project <span className="block text-lazarus">Lazarus</span>
          </h1>
          <p className="mt-6 max-w-xl text-2xl text-plate">{site.tagline}</p>
          <p className="mt-3 max-w-xl text-plate/75">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/baixar" className="rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85">
              Baixar {site.version}
            </Link>
            <Link
              href="/modpack"
              className="rounded border border-plate/40 px-6 py-3 text-plate hover:border-sunset hover:text-sunset"
            >
              Conheça o modpack
            </Link>
          </div>
          <p className="mt-16 text-sm text-plate/50">Role para sobreviver. ↓</p>
        </div>
      </DaySection>

      <DaySection day={3} className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <Chapter day={3} title="Faça silêncio. Eles escutam.">
          <p>
            No dia 3 os sentidos deles ligam. Postura, luz e barulho decidem se você é percebido. Até a sua voz no Simple
            Voice Chat vira ruído: sussurrar chega a 2,5 blocos, falar a 10, gritar a 18.
          </p>
          <Link href="/mods/stealth" className="mt-3 inline-block text-sm text-sunset hover:underline">
            Lazarus Stealth →
          </Link>
        </Chapter>
        <StealthGame />
      </DaySection>

      <DaySection day={6} className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <Radio />
        <Chapter day={6} title="O rádio chia à noite.">
          <p>
            Resgates, quedas de helicóptero, zonas de gás e pedidos de socorro chegam pelo rádio, com coordenadas
            aproximadas. Nem todo sinal é o que parece.
          </p>
        </Chapter>
      </DaySection>

      <DaySection day={7} aria-labelledby="destaques" className="mx-auto max-w-6xl px-4 py-24">
        <Chapter day={7} title="O saque começa a sumir.">
          <p>A partir de agora, cada baú vem mais vazio. Isto é o que te espera lá dentro:</p>
        </Chapter>
        <h2 id="destaques" className="sr-only">
          Como é sobreviver
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <li key={highlight.title}>
              <Link
                href={highlight.href}
                className="block h-full rounded border border-rust/40 bg-asphalt p-6 transition hover:-translate-y-1 hover:border-sunset"
              >
                <h3 className="font-stencil text-2xl text-lazarus">{highlight.title}</h3>
                <p className="mt-2 text-plate/75">{highlight.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </DaySection>

      <DaySection day={10} className="mx-auto max-w-6xl space-y-8 px-4 py-24">
        <Chapter day={10} title="A primeira horda.">
          <p>
            Ela vem pequena. A próxima vem 15% maior, e a seguinte também. Cabeça e corpo são alvos diferentes: mire na
            cabeça.
          </p>
        </Chapter>
        <div className="mx-auto max-w-4xl">
          <HordeGame />
        </div>
      </DaySection>

      <DaySection day={60} className="border-y border-rust/40 bg-asphalt">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Chapter day={60} title="Ainda de pé?">
              {slogans.map((slogan) => (
                <p key={slogan}>{slogan}</p>
              ))}
            </Chapter>
            <Link
              href="/baixar"
              className="mt-8 inline-block rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85"
            >
              Baixar {site.version} e sobreviver de verdade
            </Link>
          </div>
          <Dossier />
        </div>
      </DaySection>
    </SurvivalProvider>
  );
}
