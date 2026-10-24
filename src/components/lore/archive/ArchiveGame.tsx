"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Dossier, FactionId, OriginGateId } from "@/content/origins";
import type { Archive, ArchiveAction, ArchiveState, Step } from "@/lib/lore/archive";
import { type AmbiencePlayer, createAmbience, MUSIC } from "@/lib/lore/audio";
import { createSfx, type Sfx, type SoundName } from "@/lib/survival/sfx";
import { Dialogue } from "@/components/lore/game/Dialogue";
import { LoreSfx, SoundButton, useSoundPref } from "@/components/lore/game/sound";

export type HubProps = {
  config: ArchiveConfig;
  state: ArchiveState;
  onOpen: (id: FactionId) => void;
  onEpilogue: () => void;
  soundOn: boolean;
  onSound: (on: boolean) => void;
};

/** Tudo o que muda de um arquivo para outro: conteúdo, motor, portões, textos e o painel de escolha. */
export type ArchiveConfig = {
  code: string;
  kicker: string;
  title: string;
  intro: string;
  cover: string;
  reading: string;
  hint: string;
  startLabel: string;
  backLabel: string;
  returnLabel: string;
  openSound: SoundName;
  dossiers: Dossier[];
  engine: Archive;
  gates: Partial<Record<OriginGateId, (pass: () => void) => ReactNode>>;
  epilogue: string[];
  next: { href: string; label: string };
  Hub: ComponentType<HubProps>;
};

function readSave(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
const noop = () => () => {};

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento, a partida vale só até fechar a aba.
  }
}

/** Um arquivo jogável em dossiês: o painel de escolha (mesa, quadro) e, dentro de cada dossiê, o roteiro. */
export function ArchiveGame({ config }: { config: ArchiveConfig }) {
  const { engine, Hub } = config;
  const saved = engine.decodeSave(
    useSyncExternalStore(
      noop,
      () => readSave(engine.SAVE_KEY),
      () => "",
    ),
  );
  const [state, setState] = useState<ArchiveState | null>(null);
  const [notebook, setNotebook] = useState(false);
  const [ending, setEnding] = useState(false);
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

  const go = (next: ArchiveState, prev: ArchiveState = next) => {
    for (const cue of engine.cuesFor(next, prev)) sfx(cue.name, cue.volume);
    setState(next);
    write(engine.SAVE_KEY, engine.encodeSave(next));
  };
  const play = (action: ArchiveAction) => state && go(engine.reduce(state, action), state);

  const open = state?.open ? config.dossiers.find((d) => d.id === state.open)! : null;
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

  const step = state && engine.current(state);
  const label = open?.partLabel ?? "Parte";
  const part = open && step ? open.parts[step.part] : null;

  return (
    <LoreSfx.Provider value={sfx}>
      <section
        aria-label={config.title}
        className="relative flex h-[calc(100dvh-57px)] min-h-[600px] flex-col overflow-hidden bg-black"
      >
        <Image
          key={part?.image ?? "capa"}
          src={part?.image ?? config.cover}
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
                · {label} {part.numeral} · {part.title}
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
                {config.backLabel}
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
                Dossiê {engine.pagesFor(state, open.id).length}/{open.parts.length}
              </button>
            </div>
          </header>
        )}

        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pt-2 pb-6 sm:pb-10">
          {!state && (
            <div className="mx-auto my-auto w-full max-w-3xl">
              <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">
                {config.code} · {config.kicker}
              </p>
              <h1 className="mt-2 font-stencil text-5xl leading-none text-plate sm:text-7xl">{config.title}</h1>
              <p className="mt-5 max-w-xl text-lg text-plate/85">{config.intro}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => go(saved ? { ...saved, open: null } : engine.START)}
                  className="rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
                >
                  {config.startLabel}
                </button>
                {saved?.open && (
                  <button
                    type="button"
                    onClick={() => go(saved)}
                    className="rounded border border-plate/40 px-6 py-4 text-plate hover:border-sunset hover:text-sunset"
                  >
                    Continuar de onde parou ({config.dossiers.find((d) => d.id === saved.open)!.name})
                  </button>
                )}
                <Link href={config.reading} className="px-2 py-4 text-sm text-plate/70 underline hover:text-plate">
                  Ler sem jogar
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SoundButton on={soundOn} onChange={setSoundOn} />
                <p className="font-mono text-xs text-plate/40">{config.hint}</p>
              </div>
            </div>
          )}

          {state && !open && ending && <Epilogue config={config} onBack={() => setEnding(false)} />}

          {state && !open && !ending && (
            <Hub
              config={config}
              state={state}
              onEpilogue={() => {
                sfx("loreEnding", 0.6);
                setEnding(true);
              }}
              onOpen={(id) => {
                sfx(config.openSound, 0.9);
                go(engine.reduce(state, { type: "open", faction: id }), state);
              }}
              soundOn={soundOn}
              onSound={setSoundOn}
            />
          )}

          {step?.kind === "part" && part && (
            <div key={state!.at[open!.id]} className="mx-auto my-auto text-center">
              <div className="lore-stamp-hit plate inline-block rounded-sm px-10 py-6">
                <p className="font-stencil text-sm tracking-[0.4em] text-asphalt-deep uppercase">
                  {open!.name} · {label} {part.numeral}
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
                Ler {label === "Parte" ? "a Parte" : `o ${label}`} {part.numeral} ▸
              </button>
            </div>
          )}

          {step?.kind === "line" && (
            <div className="mt-auto">
              <FreshPage state={state!} dossier={open!} steps={engine.scriptFor(open!.id)} />
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
              {config.gates[step.gate]!(() => play({ type: "pass", gate: step.gate }))}
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
                onClick={() => {
                  const next = engine.reduce(state!, { type: "finish" });
                  go(next, state!);
                  // A última pasta lida abre o epílogo.
                  if (next.done.length === config.dossiers.length && state!.done.length < config.dossiers.length)
                    setEnding(true);
                }}
                className="mt-8 rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
              >
                {config.returnLabel}
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
                const page = engine.pagesFor(state, open.id).find((x) => x.title === p.title);
                return (
                  <li key={p.id} className="border-b border-asphalt-deep/20 pb-3">
                    <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">
                      {label} {p.numeral} · {p.title}
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
function FreshPage({ state, dossier, steps }: { state: ArchiveState; dossier: Dossier; steps: Step[] }) {
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

/** Depois de todos os dossiês: o que eles têm em comum, e a ponte para o próximo arquivo. */
function Epilogue({ config, onBack }: { config: ArchiveConfig; onBack: () => void }) {
  return (
    <div role="group" aria-labelledby="epilogo" className="mx-auto my-auto w-full max-w-2xl text-center">
      <div className="lore-paper rounded-sm px-6 py-10 text-asphalt-deep shadow-2xl sm:px-10">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">{config.code} · epílogo</p>
        <h2
          id="epilogo"
          className="lore-stamp-hit mx-auto mt-3 inline-block -rotate-3 rounded-sm border-[6px] border-lazarus px-5 py-1 font-stencil text-4xl text-lazarus uppercase sm:text-5xl"
        >
          Arquivo completo
        </h2>
        <div className="mt-6 space-y-3 text-left">
          {config.epilogue.map((p) => (
            <p key={p} className="font-hand text-2xl leading-tight">
              {p}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={config.next.href}
          className="rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
        >
          {config.next.label}
        </Link>
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-plate/30 px-6 py-4 text-plate hover:border-sunset hover:text-sunset"
        >
          {config.backLabel}
        </button>
      </div>
    </div>
  );
}
