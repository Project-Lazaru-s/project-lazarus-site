"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Dossier, dossiers, epilogue, origins } from "@/content/origins";
import { archive } from "@/lib/lore/origins";
import { type ArchiveConfig, ArchiveGame, type HubProps } from "@/components/lore/archive/ArchiveGame";
import { SoundButton } from "@/components/lore/game/sound";
import { InfirmaryGate, TradeGate, WellGate } from "./HavenGates";
import { BusGate, CrewGate, ReturnGate } from "./RoversGates";
import { EntryGate, RetreatGate, WatchGate } from "./WardensGates";
import { DosesGate, OrdersGate, QuarantineGate } from "./MilitaryGates";

const OPEN_MS = 550;

const GATES: ArchiveConfig["gates"] = {
  poco: (pass) => <WellGate onPass={pass} />,
  enfermaria: (pass) => <InfirmaryGate onPass={pass} />,
  trocas: (pass) => <TradeGate onPass={pass} />,
  onibus: (pass) => <BusGate onPass={pass} />,
  tripulacao: (pass) => <CrewGate onPass={pass} />,
  volta: (pass) => <ReturnGate onPass={pass} />,
  turnos: (pass) => <WatchGate onPass={pass} />,
  entrada: (pass) => <EntryGate onPass={pass} />,
  retirada: (pass) => <RetreatGate onPass={pass} />,
  quarentena: (pass) => <QuarantineGate onPass={pass} />,
  ordens: (pass) => <OrdersGate onPass={pass} />,
  doses: (pass) => <DosesGate onPass={pass} />,
};

/** A mesa: quatro pastas confidenciais. As lidas levam o carimbo; as ainda não escritas ficam lacradas. */
function Desk({ config, state, onOpen, onEpilogue, soundOn, onSound }: HubProps) {
  const { dossiers, engine } = config;
  const { available } = engine;
  const [opening, setOpening] = useState<Dossier["id"] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const sealed = dossiers.filter((d) => !available(d.id)).map((d) => d.name);
  const sealedNames = sealed.length > 1 ? `${sealed.slice(0, -1).join(", ")} e ${sealed.at(-1)}` : sealed[0];

  const pick = (id: Dossier["id"]) => {
    if (opening) return;
    setOpening(id);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => onOpen(id), reduced ? 0 : OPEN_MS);
  };

  return (
    <div className="mx-auto my-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">
            {config.code} · {config.title}
          </p>
          <h1 className="mt-1 font-stencil text-4xl text-plate sm:text-5xl">Escolha uma pasta</h1>
        </div>
        <div className="flex items-center gap-2">
          <SoundButton on={soundOn} onChange={onSound} />
          <Link href={config.reading} className="px-2 py-1 font-mono text-xs text-plate/60 hover:text-plate">
            Ler sem jogar
          </Link>
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {dossiers.map((d, i) => {
          const sealed = !available(d.id);
          const read = state.done.includes(d.id);
          const started = state.at[d.id] !== undefined;
          return (
            <li key={d.id} className="[perspective:1200px]">
              <button
                type="button"
                disabled={sealed}
                onClick={() => pick(d.id)}
                aria-label={sealed ? `${d.name}: pasta em recuperação` : `Abrir a pasta ${d.name}`}
                style={{ rotate: `${[-2, 1.5, -1, 2.5][i]}deg` }}
                className={`group relative block w-full text-left transition duration-300 focus-visible:outline-2 focus-visible:outline-sunset ${
                  sealed ? "cursor-not-allowed" : "hover:-translate-y-2 hover:rotate-0"
                } ${opening === d.id ? "z-10 scale-105" : ""}`}
              >
                {/* Aba da pasta. */}
                <span aria-hidden className="ml-3 block h-4 w-2/5 rounded-t-md bg-[#b8925a]" />
                <span className="relative block aspect-[4/5] rounded-sm rounded-tl-none bg-[#c9a66b] shadow-2xl">
                  {/* Folhas por dentro, que aparecem quando a capa abre. */}
                  <span aria-hidden className="lore-paper absolute inset-2 rounded-sm" />
                  <span
                    className={`absolute inset-0 flex origin-left flex-col rounded-sm rounded-tl-none bg-[#c9a66b] p-3 text-asphalt-deep shadow-[inset_0_0_30px_rgb(90_60_20/0.35)] transition-transform duration-500 [backface-visibility:hidden] sm:p-4 ${
                      opening === d.id ? "[transform:rotateY(-110deg)]" : ""
                    }`}
                  >
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-70 sm:text-xs">
                      Dossiê nº 0{i + 1}
                    </span>
                    <span
                      className={`relative mx-auto mt-3 block w-11/12 rotate-[-2deg] bg-[#f4f1e8] p-1.5 pb-4 shadow-md ${
                        sealed ? "grayscale" : ""
                      }`}
                    >
                      {/* Clipe prendendo a foto. */}
                      <span
                        aria-hidden
                        className="absolute -top-2 left-4 z-10 h-6 w-2.5 rounded-full border-2 border-zinc-400"
                      />
                      <span className="relative block aspect-[4/3] overflow-hidden">
                        <Image
                          src={d.photo}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 14rem, 45vw"
                          className="scale-125 object-cover"
                          style={{ objectPosition: d.focus, transformOrigin: d.focus }}
                        />
                      </span>
                    </span>
                    <span className="mt-auto font-stencil text-2xl leading-none sm:text-3xl">{d.name}</span>
                    <span className="mt-1 text-xs leading-tight opacity-80 sm:text-sm">{d.title}</span>
                    <span
                      aria-hidden
                      className="absolute top-[42%] right-1 z-10 rotate-[14deg] bg-[#e9dcc0]/90 rounded-sm border-2 border-lazarus px-1.5 font-stencil text-[10px] tracking-widest text-lazarus uppercase sm:text-xs"
                    >
                      Confidencial
                    </span>
                    {(read || sealed) && (
                      <span
                        className={`absolute top-[22%] left-1/2 z-10 -translate-x-1/2 -rotate-12 rounded-sm border-2 bg-[#c9a66b]/85 px-2 py-0.5 font-stencil text-sm tracking-widest whitespace-nowrap uppercase sm:border-4 sm:px-3 sm:text-lg ${
                          read
                            ? "lore-stamp-hit border-lazarus text-lazarus"
                            : "border-asphalt-deep/60 text-asphalt-deep/70"
                        }`}
                      >
                        {read ? "Lido" : "Em recuperação"}
                      </span>
                    )}
                  </span>
                </span>
              </button>
              {started && !read && <p className="mt-2 text-center font-mono text-[11px] text-plate/60">em andamento</p>}
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <p className="font-mono text-xs text-plate/50">
          {state.done.length}/{dossiers.filter((d) => available(d.id)).length} pastas lidas
          {sealedNames && ` · ${sealedNames} ainda estão em recuperação.`}
        </p>
        {state.done.length === dossiers.length && (
          <button
            type="button"
            onClick={onEpilogue}
            className="rounded border border-sunset/60 px-4 py-2 text-sm text-sunset hover:bg-sunset/10"
          >
            Ler o epílogo
          </button>
        )}
      </div>
    </div>
  );
}

const ORIGINS: ArchiveConfig = {
  code: "Arquivo 02",
  kicker: "Dossiês de origem",
  title: origins.title,
  intro: origins.intro,
  cover: origins.cover,
  reading: `/lore/${origins.slug}/leitura`,
  hint: "~3 min por pasta · melhor com fone · Esc abre o dossiê",
  startLabel: "Abrir o arquivo",
  backLabel: "Voltar às pastas",
  returnLabel: "Devolver a pasta ao arquivo",
  openSound: "loreFolder",
  dossiers,
  engine: archive,
  gates: GATES,
  epilogue,
  next: { href: "/lore/o-inicio-do-caos", label: "Jogar o Arquivo 01: O Início do Caos" },
  Hub: Desk,
};

/** "Antes das Bandeiras" jogável: a mesa com as quatro pastas e, dentro de cada uma, a origem da facção. */
export function OriginsGame() {
  return <ArchiveGame config={ORIGINS} />;
}
