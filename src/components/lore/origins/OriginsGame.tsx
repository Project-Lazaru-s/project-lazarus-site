"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type Dossier, dossiers, type OriginGateId, origins } from "@/content/origins";
import {
  available,
  cuesFor,
  current,
  decodeSave,
  encodeSave,
  type OriginsAction,
  type OriginsState,
  pagesFor,
  reduce,
  SAVE_KEY,
  scriptFor,
  START,
} from "@/lib/lore/origins";
import { type AmbiencePlayer, createAmbience, MUSIC } from "@/lib/lore/audio";
import { createSfx, type Sfx, type SoundName } from "@/lib/survival/sfx";
import { Dialogue } from "@/components/lore/game/Dialogue";
import { LoreSfx, SoundButton, useSoundPref } from "@/components/lore/game/sound";
import { InfirmaryGate, TradeGate, WellGate } from "./HavenGates";
import { BusGate, CrewGate, ReturnGate } from "./RoversGates";

const READING = `/lore/${origins.slug}/leitura`;
const OPEN_MS = 550;

function readSave() {
  try {
    return localStorage.getItem(SAVE_KEY) ?? "";
  } catch {
    return "";
  }
}
const noop = () => () => {};

function write(state: OriginsState) {
  try {
    localStorage.setItem(SAVE_KEY, encodeSave(state));
  } catch {
    // Sem armazenamento, a partida vale só até fechar a aba.
  }
}

const GATES: Record<OriginGateId, (pass: () => void) => ReactNode> = {
  poco: (pass) => <WellGate onPass={pass} />,
  enfermaria: (pass) => <InfirmaryGate onPass={pass} />,
  trocas: (pass) => <TradeGate onPass={pass} />,
  onibus: (pass) => <BusGate onPass={pass} />,
  tripulacao: (pass) => <CrewGate onPass={pass} />,
  volta: (pass) => <ReturnGate onPass={pass} />,
};

/** "Antes das Bandeiras" jogável: a mesa com as quatro pastas e, dentro de cada uma, a origem da facção. */
export function OriginsGame() {
  const saved = decodeSave(useSyncExternalStore(noop, readSave, () => ""));
  const [state, setState] = useState<OriginsState | null>(null);
  const [notebook, setNotebook] = useState(false);
  const [soundOn, setSoundOn] = useSoundPref();

  const sfxRef = useRef<Sfx>(null);
  const musicRef = useRef<AmbiencePlayer>(null);
  const ambienceRef = useRef<AmbiencePlayer>(null);
  const audio = typeof Audio === "undefined" ? undefined : Audio;
  const sfx = useCallback(
    (name: SoundName, volume?: number) => {
      if (soundOn) (sfxRef.current ??= createSfx(audio)).play(name, volume);
    },
    [soundOn, audio],
  );

  const go = (next: OriginsState, prev: OriginsState = next) => {
    for (const cue of cuesFor(next, prev)) sfx(cue.name, cue.volume);
    setState(next);
    write(next);
  };
  const play = (action: OriginsAction) => state && go(reduce(state, action), state);

  const open = state?.open ? dossiers.find((d) => d.id === state.open)! : null;
  const playing = state !== null;
  useEffect(() => {
    const music = (musicRef.current ??= createAmbience(audio));
    if (soundOn && playing) music.play(MUSIC, 0.4);
    else music.stop();
  }, [soundOn, playing, audio]);
  const bedSrc = open?.ambience ?? null;
  useEffect(() => {
    const bed = (ambienceRef.current ??= createAmbience(audio));
    if (soundOn && bedSrc) bed.play(bedSrc, 0.25);
    else bed.stop();
  }, [soundOn, bedSrc, audio]);
  useEffect(
    () => () => {
      musicRef.current?.stop();
      ambienceRef.current?.stop();
    },
    [],
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNotebook((o) => !o);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const step = state && current(state);
  const part = open && step ? open.parts[step.part] : null;

  return (
    <LoreSfx.Provider value={sfx}>
      <section
        aria-label={origins.title}
        className="relative flex h-[calc(100dvh-57px)] min-h-[600px] flex-col overflow-hidden bg-black"
      >
        <Image
          key={part?.image ?? "capa"}
          src={part?.image ?? origins.cover}
          alt=""
          fill
          priority
          sizes="100vw"
          className="lore-kenburns object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/85 ${open ? "" : "bg-black/45"}`}
        />

        {state && open && part && step && (
          <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 font-mono text-xs text-plate/70">
            <p>
              <span className="text-sunset">{open.name}</span>
              <span className="hidden sm:inline">
                {" "}
                · Parte {part.numeral} · {part.title}
              </span>
              <span className="text-plate/40">
                {" "}
                · {step.part + 1}/{open.parts.length}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <SoundButton on={soundOn} onChange={setSoundOn} />
              <button
                type="button"
                onClick={() => {
                  setNotebook(false);
                  play({ type: "close" });
                }}
                className="rounded border border-plate/30 bg-black/50 px-3 py-1.5 hover:border-sunset hover:text-sunset pointer-coarse:min-h-11"
              >
                Voltar às pastas
              </button>
              <button
                type="button"
                aria-expanded={notebook}
                onClick={() => {
                  sfx("lorePage", 0.5);
                  setNotebook((o) => !o);
                }}
                className="rounded border border-plate/30 bg-black/50 px-3 py-1.5 hover:border-sunset hover:text-sunset pointer-coarse:min-h-11"
              >
                Dossiê {pagesFor(state, open.id).length}/{open.parts.length}
              </button>
            </div>
          </header>
        )}

        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pt-2 pb-6 sm:pb-10">
          {!state && (
            <div className="mx-auto my-auto w-full max-w-3xl">
              <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">Arquivo 02 · Dossiês de origem</p>
              <h1 className="mt-2 font-stencil text-5xl leading-none text-plate sm:text-7xl">{origins.title}</h1>
              <p className="mt-5 max-w-xl text-lg text-plate/85">{origins.intro}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => go(saved ? { ...saved, open: null } : START)}
                  className="rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
                >
                  Abrir o arquivo
                </button>
                {saved?.open && (
                  <button
                    type="button"
                    onClick={() => go(saved)}
                    className="rounded border border-plate/40 px-6 py-4 text-plate hover:border-sunset hover:text-sunset"
                  >
                    Continuar de onde parou ({dossiers.find((d) => d.id === saved.open)!.name})
                  </button>
                )}
                <Link href={READING} className="px-2 py-4 text-sm text-plate/70 underline hover:text-plate">
                  Ler sem jogar
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SoundButton on={soundOn} onChange={setSoundOn} />
                <p className="font-mono text-xs text-plate/40">
                  ~3 min por pasta · melhor com fone · Esc abre o dossiê
                </p>
              </div>
            </div>
          )}

          {state && !open && (
            <Desk
              state={state}
              onOpen={(id) => {
                sfx("loreFolder", 0.9);
                go(reduce(state, { type: "open", faction: id }), state);
              }}
              soundOn={soundOn}
              onSound={setSoundOn}
            />
          )}

          {step?.kind === "part" && part && (
            <div key={state!.at[open!.id]} className="mx-auto my-auto text-center">
              <div className="lore-stamp-hit plate inline-block rounded-sm px-10 py-6">
                <p className="font-stencil text-sm tracking-[0.4em] text-asphalt-deep uppercase">
                  {open!.name} · Parte {part.numeral}
                </p>
                <h2 className="font-stencil text-4xl text-lazarus sm:text-6xl">{part.title}</h2>
              </div>
              <p className="mt-5 font-mono text-xs tracking-widest text-plate/70 uppercase">{part.when}</p>
              <button
                type="button"
                autoFocus
                onClick={() => play({ type: "next" })}
                className="mt-8 rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85"
              >
                Ler a Parte {part.numeral} ▸
              </button>
            </div>
          )}

          {step?.kind === "line" && (
            <div className="mt-auto">
              <FreshPage state={state!} dossier={open!} />
              {step.image && (
                <figure key={step.image} className="lore-page-toast mx-auto mb-3 w-full max-w-3xl">
                  <Image
                    src={step.image}
                    alt={step.alt ?? ""}
                    width={1672}
                    height={941}
                    sizes="(min-width: 768px) 48rem, 100vw"
                    className="mx-auto h-auto max-h-[42vh] w-auto max-w-full rounded border-2 border-plate/30 shadow-2xl"
                  />
                </figure>
              )}
              <Dialogue
                key={state!.at[open!.id]}
                text={step.text}
                quote={step.quote}
                onNext={() => play({ type: "next" })}
              />
            </div>
          )}

          {step?.kind === "gate" && (
            <div key={state!.at[open!.id]} className="my-auto">
              {GATES[step.gate](() => play({ type: "pass", gate: step.gate }))}
            </div>
          )}

          {step?.kind === "end" && open?.trace && (
            <div role="group" aria-labelledby="vestigio" className="mx-auto my-auto w-full max-w-xl text-center">
              <div className="lore-paper rounded-sm px-6 py-10 text-asphalt-deep shadow-2xl">
                <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Item recuperado</p>
                <h2 id="vestigio" className="mt-2 font-stencil text-4xl text-lazarus">
                  {open.trace.title}
                </h2>
                <p className="mt-4 font-hand text-2xl leading-tight">{open.trace.text}</p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => play({ type: "finish" })}
                className="mt-8 rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
              >
                Devolver a pasta ao arquivo
              </button>
            </div>
          )}
        </div>

        {notebook && state && open && (
          <aside
            aria-label={`Dossiê ${open.name}`}
            className="lore-paper absolute inset-y-0 right-0 z-20 w-[min(22rem,90vw)] overflow-y-auto p-6 text-asphalt-deep shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">Dossiê · {open.name}</p>
                <p className="font-stencil text-xl">{open.title}</p>
              </div>
              <button
                type="button"
                aria-label="Fechar dossiê"
                onClick={() => setNotebook(false)}
                className="ml-auto flex size-10 items-center justify-center rounded border border-asphalt-deep/30 text-lg"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-sm">
              <span className="font-semibold">O que formou o grupo:</span> {open.need}
            </p>
            <ol className="mt-6 space-y-4">
              {open.parts.map((p) => {
                const page = pagesFor(state, open.id).find((x) => x.title === p.title);
                return (
                  <li key={p.id} className="border-b border-asphalt-deep/20 pb-3">
                    <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">
                      Parte {p.numeral} · {p.title}
                    </p>
                    <p className="font-hand text-2xl leading-tight">{page ? page.note : "· · ·"}</p>
                  </li>
                );
              })}
            </ol>
          </aside>
        )}
      </section>
    </LoreSfx.Provider>
  );
}

/** A anotação que acabou de entrar no dossiê: só na fala logo depois do portão. */
function FreshPage({ state, dossier }: { state: OriginsState; dossier: Dossier }) {
  const steps = scriptFor(dossier.id);
  const at = state.at[dossier.id]!;
  const previous = steps[at - 1];
  if (previous?.kind !== "gate") return null;
  const note = dossier.parts[previous.part].note;
  return (
    <div className="lore-page-toast mx-auto mb-3 w-full max-w-3xl rounded border border-sunset/40 bg-black/70 p-3">
      <p className="font-mono text-[11px] tracking-widest text-sunset uppercase">Página do dossiê recuperada</p>
      <p className="font-hand text-2xl leading-tight text-plate">{note}</p>
    </div>
  );
}

/** A mesa: quatro pastas confidenciais. As lidas levam o carimbo; as ainda não escritas ficam lacradas. */
function Desk({
  state,
  onOpen,
  soundOn,
  onSound,
}: {
  state: OriginsState;
  onOpen: (id: Dossier["id"]) => void;
  soundOn: boolean;
  onSound: (on: boolean) => void;
}) {
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
          <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">Arquivo 02 · {origins.title}</p>
          <h1 className="mt-1 font-stencil text-4xl text-plate sm:text-5xl">Escolha uma pasta</h1>
        </div>
        <div className="flex items-center gap-2">
          <SoundButton on={soundOn} onChange={onSound} />
          <Link href={READING} className="px-2 py-1 font-mono text-xs text-plate/60 hover:text-plate">
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

      <p className="mt-8 font-mono text-xs text-plate/50">
        {state.done.length}/{dossiers.filter((d) => available(d.id)).length} pastas lidas
        {sealedNames && ` · ${sealedNames} ainda estão em recuperação.`}
      </p>
    </div>
  );
}
