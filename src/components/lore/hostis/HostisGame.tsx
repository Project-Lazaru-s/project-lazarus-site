"use client";

import Image from "next/image";
import Link from "next/link";
import { gangEmblems, hostileDossiers, hostileEpilogue, hostis } from "@/content/hostis";
import { archive } from "@/lib/lore/hostis";
import { type ArchiveConfig, ArchiveGame, type HubProps } from "@/components/lore/archive/ArchiveGame";
import { SoundButton } from "@/components/lore/game/sound";
import { DawnGate, LightGate, PatrolGate, RadioDaysGate, TallyGate, TestimonyGate } from "./HostileGates";
import { CrowbarGate, GutterGate, PickCaseGate, StaticGate } from "./GangCases";

const GATES: ArchiveConfig["gates"] = {
  radio: (pass) => <RadioDaysGate onPass={pass} />,
  madrugada: (pass) => <DawnGate onPass={pass} />,
  patrulha: (pass) => <PatrolGate onPass={pass} />,
  conta: (pass) => <TallyGate onPass={pass} />,
  versoes: (pass) => <TestimonyGate onPass={pass} />,
  luz: (pass) => <LightGate onPass={pass} />,
  rust: (pass) => <PickCaseGate id="rust" onPass={pass} />,
  lantern: (pass) => <PickCaseGate id="lantern" onPass={pass} />,
  crowbar: (pass) => <CrowbarGate onPass={pass} />,
  redtape: (pass) => <PickCaseGate id="redtape" onPass={pass} />,
  gutter: (pass) => <GutterGate onPass={pass} />,
  static: (pass) => <StaticGate onPass={pass} />,
  tin: (pass) => <PickCaseGate id="tin" onPass={pass} />,
  pine: (pass) => <PickCaseGate id="pine" onPass={pass} />,
};

/** O que fica preso no quadro para cada dossiê: o objeto deixado por quem passou por eles. */
function Pinned({ id }: { id: string }) {
  if (id === "desertores")
    return (
      <span className="flex h-full flex-col items-center justify-center gap-2">
        <span aria-hidden className="h-2 w-16 rounded-full border-2 border-zinc-400" />
        <span className="flex h-20 w-32 flex-col justify-center rounded-[1.2rem] border-2 border-zinc-500 bg-gradient-to-br from-zinc-300 to-zinc-500 px-3 font-mono text-[10px] leading-tight text-zinc-800 shadow-md">
          <span className="line-through">UNID. ████</span>
          <span>POSTO 7 · ESTRADA</span>
          <span className="opacity-60">insígnia arrancada</span>
        </span>
      </span>
    );
  if (id === "hollow")
    return (
      <span className="lore-paper flex h-full -rotate-2 items-center justify-center p-3 text-center font-hand text-2xl leading-tight text-asphalt-deep shadow-md">
        “Não sigam a luz no oco do prédio.”
      </span>
    );
  return (
    <span className="lore-paper grid h-full grid-cols-4 place-items-center gap-1 p-2 shadow-md">
      {Object.values(gangEmblems).map((src) => (
        <Image key={src} src={src} alt="" width={48} height={48} className="size-9 sm:size-11" />
      ))}
    </span>
  );
}

/** O quadro de alertas: três objetos presos com alfinete. Investigados ganham o barbante vermelho. */
function Board({ config, state, onOpen, onEpilogue, soundOn, onSound }: HubProps) {
  const { dossiers } = config;
  return (
    <div className="mx-auto my-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">
            {config.code} · {config.title}
          </p>
          <h1 className="mt-1 font-stencil text-4xl text-plate sm:text-5xl">Quadro de alertas</h1>
        </div>
        <div className="flex items-center gap-2">
          <SoundButton on={soundOn} onChange={onSound} />
          <Link href={config.reading} className="px-2 py-1 font-mono text-xs text-plate/60 hover:text-plate">
            Ler sem jogar
          </Link>
        </div>
      </div>

      <ul className="mt-8 grid gap-6 rounded-md border-8 border-[#5b3b22] bg-[#a87f52] p-5 shadow-2xl [background-image:radial-gradient(rgb(0_0_0/0.12)_1px,transparent_1px)] [background-size:6px_6px] sm:grid-cols-3">
        {dossiers.map((d, i) => {
          const read = state.done.includes(d.id);
          const started = state.at[d.id] !== undefined;
          return (
            <li key={d.id} className="relative">
              {/* Alfinete. */}
              <span
                aria-hidden
                className={`absolute -top-2 left-1/2 z-10 size-4 -translate-x-1/2 rounded-full shadow ${read ? "bg-lazarus" : "bg-zinc-200"}`}
              />
              <button
                type="button"
                onClick={() => onOpen(d.id)}
                aria-label={`Investigar: ${d.name}`}
                style={{ rotate: `${[-2, 1.5, -1][i]}deg` }}
                className="group flex w-full flex-col text-left transition hover:-translate-y-1 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-sunset"
              >
                <span className="block h-40">
                  <Pinned id={d.id} />
                </span>
                <span className="mt-3 block rounded-sm bg-black/70 px-3 py-2 text-plate">
                  <span className="block font-stencil text-2xl leading-none">{d.name}</span>
                  <span className="mt-1 block text-xs text-plate/75">{d.title}</span>
                  {read ? (
                    <span className="lore-stamp-hit mt-2 inline-block -rotate-3 rounded-sm border-2 border-lazarus px-2 font-stencil text-sm tracking-widest text-lazarus uppercase">
                      Investigado
                    </span>
                  ) : (
                    started && <span className="mt-2 block font-mono text-[11px] text-plate/60">em andamento</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <p className="font-mono text-xs text-plate/50">
          {state.done.length}/{dossiers.length} alertas investigados
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

const HOSTIS: ArchiveConfig = {
  code: "Arquivo 03",
  kicker: hostis.subtitle,
  title: hostis.title,
  intro: hostis.intro,
  cover: hostis.cover,
  reading: `/lore/${hostis.slug}/leitura`,
  hint: "~4 min por alerta · melhor com fone · Esc abre o dossiê",
  startLabel: "Olhar o quadro",
  backLabel: "Voltar ao quadro",
  returnLabel: "Prender no quadro com o barbante",
  openSound: "lorePage",
  dossiers: hostileDossiers,
  engine: archive,
  gates: GATES,
  epilogue: hostileEpilogue,
  next: { href: "/baixar", label: "Baixar e começar o seu Dia 1" },
  Hub: Board,
};

/** "Os Hostis" jogável: o quadro de alertas e, em cada alerta, como o grupo cruzou a linha. */
export function HostisGame() {
  return <ArchiveGame config={HOSTIS} />;
}
