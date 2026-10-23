import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChestGame } from "@/components/games/ChestGame";
import { HordeGame } from "@/components/games/HordeGame";
import { LootGame } from "@/components/games/LootGame";
import { StealthGame } from "@/components/games/StealthGame";
import { TakedownGame } from "@/components/games/TakedownGame";
import { MapGame } from "@/components/games/MapGame";
import { TraderGame } from "@/components/games/TraderGame";
import { VoiceGame } from "@/components/games/VoiceGame";
import { WaterGame } from "@/components/games/WaterGame";
import { Radio } from "@/components/radio/Radio";
import { RadioInterrupt } from "@/components/radio/RadioInterrupt";
import { AchievementToasts } from "@/components/survival/AchievementToasts";
import { AmbientZombies } from "@/components/survival/AmbientZombies";
import { DaySection } from "@/components/survival/DaySection";
import { DayStamp } from "@/components/survival/DayStamp";
import { Dossier } from "@/components/survival/Dossier";
import { Flashlight } from "@/components/survival/Flashlight";
import { ResumeBanner } from "@/components/survival/ResumeBanner";
import { Scenery } from "@/components/survival/Scenery";
import { ConnectedAtmosphere, ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import { slogans } from "@/content/home";
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
    <SurvivalProvider persist clock>
      <ConnectedAtmosphere />
      <ConnectedHud />
      <Scenery />
      <AmbientZombies />
      <DayStamp />
      <ResumeBanner />
      <AchievementToasts />
      <RadioInterrupt />

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
            {/* No celular a versão desce de linha inteira, sem deixar um "·" pendurado. */}
            Minecraft 1.20.1 · Forge<span className="max-sm:hidden"> · </span>
            <br className="sm:hidden" />
            Versão {site.version}
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

      <DaySection
        day={3}
        id="silencio"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1fr_1.4fr] lg:items-center"
      >
        <Chapter day={3} title="Faça silêncio. Eles escutam.">
          <p>
            No dia 3 os sentidos deles ligam. Postura, luz e barulho decidem se você é percebido. Até a sua voz no
            Simple Voice Chat vira ruído: sussurrar chega a 2,5 blocos, falar a 10, gritar a 18.
          </p>
          <Link href="/mods/stealth" className="mt-3 inline-block text-sm text-sunset hover:underline">
            Lazarus Stealth →
          </Link>
        </Chapter>
        <StealthGame />
      </DaySection>

      <DaySection
        day={4}
        id="fale-baixo"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <VoiceGame />
        <Chapter day={4} title="Fale baixo.">
          <p>
            Com o Simple Voice Chat, a sua voz de verdade vira ruído no jogo. Seu amigo grita no fone, e a rua inteira
            escuta. Teste com o seu microfone, ou com os botões.
          </p>
        </Chapter>
      </DaySection>

      <DaySection
        day={5}
        id="sede"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <WaterGame />
        <Chapter day={5} title="Não beba essa água.">
          <p>
            Rio, poça ou caldeirão podem trazer disenteria: enjoo, vômito que leva comida e água e, desidratado, um
            quadro grave. Água engarrafada ou enlatada é segura.
          </p>
          <Link href="/mods/moodles" className="mt-3 inline-block text-sm text-sunset hover:underline">
            Lazarus Moodles →
          </Link>
        </Chapter>
      </DaySection>

      <DaySection
        day={6}
        id="radio"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <Radio />
        <Chapter day={6} title="O rádio chia à noite.">
          <p>
            Resgates, quedas de helicóptero, zonas de gás e pedidos de socorro chegam pelo rádio, com coordenadas
            aproximadas. Nem todo sinal é o que parece.
          </p>
        </Chapter>
      </DaySection>

      <DaySection day={7} id="bau" className="mx-auto max-w-6xl space-y-10 px-4 py-24">
        <Chapter day={7} title="O saque começa a sumir.">
          <p>
            A partir de agora, cada baú vem mais vazio. Este ainda está trancado. Abra para ver o que te espera lá
            dentro.
          </p>
        </Chapter>
        <ChestGame />
      </DaySection>

      <DaySection day={10} id="horda" className="mx-auto max-w-6xl space-y-8 px-4 py-24">
        <Chapter day={10} title="A primeira horda.">
          <p>
            Ela vem pequena. A próxima vem 15% maior, e a seguinte também. Cabeça e corpo são alvos diferentes: mire na
            cabeça.
          </p>
        </Chapter>
        <div className="mx-auto max-w-4xl">
          <Flashlight>
            <HordeGame />
          </Flashlight>
        </div>
      </DaySection>

      <DaySection
        day={13}
        id="por-tras"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1fr_1.4fr] lg:items-center"
      >
        <Chapter day={13} title="Sem fazer barulho.">
          <p>
            Tiro chama a rua inteira. Por trás, uma finalização furtiva resolve em silêncio, se você acertar o momento.
            Errar é levar uma mordida.
          </p>
        </Chapter>
        <Flashlight>
          <TakedownGame />
        </Flashlight>
      </DaySection>

      <DaySection
        day={15}
        id="farmacia"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <LootGame />
        <Chapter day={15} title="A farmácia já foi saqueada.">
          <p>
            No dia 15, os locais comuns guardam 42% do saque do começo. Se você está doente ou mordido, reze por um
            antibiótico.
          </p>
          <Link href="/mods/scarcity" className="mt-3 inline-block text-sm text-sunset hover:underline">
            Lazarus Scarcity →
          </Link>
        </Chapter>
      </DaySection>

      <DaySection
        day={20}
        id="rovers"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1fr_1.4fr] lg:items-center"
      >
        <Chapter day={20} title="Os vivos também cobram.">
          <p>
            Facções guardam a sua reputação, de -100 a +100. Troque com os Rovers, pechinche ou intimide. Desça até -40
            e caçadores de recompensa vão até a última posição em que te viram.
          </p>
          <Link href="/faccoes" className="mt-3 inline-block text-sm text-sunset hover:underline">
            Conheça as facções →
          </Link>
        </Chapter>
        <TraderGame />
      </DaySection>

      <DaySection
        day={25}
        id="mapa"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <MapGame />
        <Chapter day={25} title="Sem placa, sem estrada.">
          <p>
            Os postos militares estão caindo e as rotas seguras somem. No Lazarus Maps você rabisca o próprio mapa de
            papel, anota em oito cores e tem um GPS com coordenadas para não se perder.
          </p>
          <Link href="/mods/maps" className="mt-3 inline-block text-sm text-sunset hover:underline">
            Lazarus Maps →
          </Link>
        </Chapter>
      </DaySection>

      <DaySection day={60} id="dossie" className="border-y border-rust/40 bg-asphalt">
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
            <p className="mt-4 text-plate/75">
              Quer guerra contra outros jogadores?{" "}
              <Link href="/servidor" className="text-sunset underline hover:text-plate">
                Aliste-se no servidor
              </Link>
            </p>
          </div>
          <Dossier />
        </div>
      </DaySection>
    </SurvivalProvider>
  );
}
