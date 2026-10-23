"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { dayOne, inicioDoCaos, roads, whoIsWho } from "@/content/lore";
import { site } from "@/content/site";
import {
  decodeSave,
  encodeSave,
  type GateId,
  pages,
  progress,
  reduce,
  SAVE_KEY,
  script,
  START,
  type StoryAction,
  type StoryState,
} from "@/lib/lore/story";
import { AMBIENCE, type AmbiencePlayer, createAmbience, cuesFor, MUSIC } from "@/lib/lore/audio";
import { createSfx, type Sfx, type SoundName } from "@/lib/survival/sfx";
import { CompareGate, InspectGate, RadioGate, RoadGate, TriageGate, WallsGate } from "./Gates";
import { LoreSfx, SoundButton, useSoundPref } from "./sound";
import { LorePhoto } from "@/components/lore/LorePhoto";
import { Dialogue } from "./Dialogue";

const { acts } = inicioDoCaos;

// ---------- Partida salva (o localStorage é lido como string e validado no decode) ----------

function readSave() {
  try {
    return localStorage.getItem(SAVE_KEY) ?? "";
  } catch {
    return "";
  }
}
const noop = () => () => {};

function write(state: StoryState) {
  try {
    localStorage.setItem(SAVE_KEY, encodeSave(state));
  } catch {
    // Sem armazenamento, a partida vale só até fechar a aba.
  }
}

/** A anotação da enfermeira que acabou de entrar no caderno. */
function PageToast({ note }: { note: string }) {
  return (
    <div className="lore-page-toast mx-auto mb-3 flex w-full max-w-3xl items-center gap-3 rounded border border-sunset/40 bg-black/70 p-3">
      <Image
        src="/images/lore/enfermeira.png"
        alt=""
        width={56}
        height={56}
        className="pixelated shrink-0 rounded-sm bg-asphalt"
      />
      <div>
        <p className="font-mono text-[11px] tracking-widest text-sunset uppercase">Página recuperada</p>
        <p className="font-hand text-2xl leading-tight text-plate">{note}</p>
      </div>
    </div>
  );
}

// ---------- Jogo ----------

const GATES: Record<GateId, (pass: (road?: string) => void) => ReactNode> = {
  triagem: (pass) => <TriageGate onPass={pass} />,
  radio: (pass) => <RadioGate onPass={pass} />,
  investigar: (pass) => <InspectGate onPass={pass} />,
  comparar: (pass) => <CompareGate onPass={pass} />,
  paredes: (pass) => <WallsGate onPass={pass} />,
  estrada: (pass) => <RoadGate onPass={pass} />,
};

/** "O Início do Caos" jogável: uma tela por vez, e cada ato só avança quando o jogador age. */
export function StoryGame() {
  const saved = decodeSave(useSyncExternalStore(noop, readSave, () => ""));
  const [state, setState] = useState<StoryState | null>(null);
  const [notebook, setNotebook] = useState(false);
  const [notebookTab, setNotebookTab] = useState<"paginas" | "quem">("paginas");
  const [soundOn, setSoundOn] = useSoundPref();

  // Áudio criado só no primeiro uso (depois de um clique), nunca no servidor.
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

  const go = (next: StoryState, prev?: StoryState) => {
    for (const cue of cuesFor(next, prev)) sfx(cue.name, cue.volume);
    setState(next);
    write(next);
  };
  const play = (action: StoryAction) => state && go(reduce(state, action), state);
  const begin = (from: StoryState) => go(from);
  const toggleNotebook = () => {
    sfx("lorePage", 0.5);
    setNotebook((open) => !open);
  };

  // Música da partida inteira e ambiente do ato atual, ambos em loop. Somem no título e sem som.
  const playing = state !== null;
  const ambienceAct = state ? script[state.at].act : null;
  useEffect(() => {
    const music = (musicRef.current ??= createAmbience(audio));
    if (soundOn && playing) music.play(MUSIC, 0.45);
    else music.stop();
  }, [soundOn, playing, audio]);
  useEffect(() => {
    const bed = (ambienceRef.current ??= createAmbience(audio));
    const src = ambienceAct === null ? null : AMBIENCE[ambienceAct];
    if (soundOn && src) bed.play(src, 0.25);
    else bed.stop();
  }, [soundOn, ambienceAct, audio]);
  useEffect(
    () => () => {
      musicRef.current?.stop();
      ambienceRef.current?.stop();
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNotebook((open) => !open);
    // ponytail: Esc não toca o som de página; só o botão do caderno.
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const step = state && script[state.at];
  const act = step ? acts[step.act] : null;
  const found = state ? pages(state) : [];
  // A fala logo depois do portão que rende a página mostra a anotação recuperada.
  const previous = state && state.at > 0 ? script[state.at - 1] : null;
  const fresh =
    previous?.kind === "gate" && step?.kind === "line"
      ? found.find((p) => p.title === acts[previous.act].title)
      : undefined;

  return (
    <LoreSfx.Provider value={sfx}>
      <section
        aria-label={inicioDoCaos.title}
        className="relative flex h-[calc(100dvh-57px)] min-h-[600px] flex-col overflow-hidden bg-black"
      >
        <Image
          key={act?.image ?? "capa"}
          src={act?.image ?? "/images/lore/cover.png"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="lore-kenburns object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85"
          // A noite cai de ato em ato.
          style={{ backgroundColor: `rgb(5 7 13 / ${step ? 0.1 + step.act * 0.08 : 0.35})` }}
        />

        {state && step && act && (
          <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 font-mono text-xs text-plate/70">
            <p>
              <span className="text-sunset">Ato {act.numeral}</span>
              <span className="hidden sm:inline"> · {act.title}</span>
              <span className="text-plate/40">
                {" "}
                · {progress(state).act + 1}/{progress(state).of}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <SoundButton on={soundOn} onChange={setSoundOn} />
              <Link href="/lore/o-inicio-do-caos/leitura" className="hidden px-2 py-1 hover:text-plate sm:inline">
                Ler sem jogar
              </Link>
              <button
                type="button"
                aria-expanded={notebook}
                onClick={toggleNotebook}
                className="rounded border border-plate/30 bg-black/50 px-3 py-1.5 hover:border-sunset hover:text-sunset pointer-coarse:min-h-11"
              >
                Caderno {found.length}/{acts.length}
              </button>
            </div>
          </header>
        )}

        {/* Margens auto em vez de justify-end: um portão mais alto que a tela continua rolável até o topo. */}
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pt-2 pb-6 sm:pb-10">
          {!state && (
            <div className="mx-auto my-auto w-full max-w-3xl">
              <p className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">
                Arquivo 01 · Caderno de triagem
              </p>
              <h1 className="mt-2 font-stencil text-5xl leading-none text-plate sm:text-7xl">{inicioDoCaos.title}</h1>
              <p className="mt-5 max-w-xl text-lg text-plate/85">{inicioDoCaos.intro}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => begin(START)}
                  className="rounded bg-lazarus px-8 py-4 text-lg font-semibold text-plate hover:bg-lazarus/85"
                >
                  Novo jogo
                </button>
                {saved && saved.at > 0 && (
                  <button
                    type="button"
                    onClick={() => begin(saved)}
                    className="rounded border border-plate/40 px-6 py-4 text-plate hover:border-sunset hover:text-sunset"
                  >
                    Continuar de onde parou (Ato {acts[script[saved.at].act].numeral})
                  </button>
                )}
                <Link
                  href="/lore/o-inicio-do-caos/leitura"
                  className="px-2 py-4 text-sm text-plate/70 underline hover:text-plate"
                >
                  Ler sem jogar
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SoundButton on={soundOn} onChange={setSoundOn} />
                <p className="font-mono text-xs text-plate/40">
                  ~8 min · melhor com fone · toque, clique ou Enter para avançar · Esc abre o caderno
                </p>
              </div>
            </div>
          )}

          {step?.kind === "act" && act && (
            <div key={state!.at} className="mx-auto my-auto text-center">
              <div className="lore-stamp-hit plate inline-block rounded-sm px-10 py-6">
                <p className="font-stencil text-sm tracking-[0.4em] text-asphalt-deep uppercase">Ato {act.numeral}</p>
                <h2 className="font-stencil text-4xl text-lazarus sm:text-6xl">{act.title}</h2>
              </div>
              <p className="mt-5 font-mono text-xs tracking-widest text-plate/70 uppercase">{act.when}</p>
              <button
                type="button"
                autoFocus
                onClick={() => play({ type: "next" })}
                className="mt-8 rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85"
              >
                Começar o Ato {act.numeral} ▸
              </button>
            </div>
          )}

          {step?.kind === "line" && (
            <div className="mt-auto">
              {fresh && <PageToast note={fresh.note} />}
              {step.image && (
                <figure key={step.image} className="lore-page-toast mx-auto mb-3 w-full max-w-3xl">
                  <Image
                    src={step.image}
                    alt={step.alt ?? ""}
                    width={1600}
                    height={900}
                    sizes="(min-width: 768px) 48rem, 100vw"
                    className="mx-auto h-auto max-h-[42vh] w-auto max-w-full rounded border-2 border-plate/30 shadow-2xl"
                  />
                </figure>
              )}
              <Dialogue key={state!.at} text={step.text} quote={step.quote} onNext={() => play({ type: "next" })} />
            </div>
          )}

          {step?.kind === "gate" && (
            <div key={state!.at} className="my-auto">
              {GATES[step.gate]((road) => play({ type: "pass", gate: step.gate, road }))}
            </div>
          )}

          {step?.kind === "end" && state && (
            <Ending state={state} found={found.length} onRestart={() => begin(START)} />
          )}
        </div>

        {notebook && state && (
          <aside
            aria-label="Caderno de triagem"
            className="lore-paper absolute inset-y-0 right-0 z-20 w-[min(22rem,90vw)] overflow-y-auto p-6 text-asphalt-deep shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/lore/enfermeira.png"
                alt=""
                width={56}
                height={56}
                className="pixelated rounded-sm bg-asphalt"
              />
              <div>
                <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">Caderno de triagem</p>
                <p className="font-stencil text-xl">
                  {found.length}/{acts.length} páginas
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar caderno"
                onClick={() => setNotebook(false)}
                className="ml-auto flex size-10 items-center justify-center rounded border border-asphalt-deep/30 text-lg"
              >
                ×
              </button>
            </div>
            <div role="tablist" aria-label="Seções do caderno" className="mt-5 flex gap-1">
              {(
                [
                  ["paginas", "Páginas"],
                  ["quem", "Quem é quem"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={notebookTab === id}
                  onClick={() => setNotebookTab(id)}
                  className={`flex-1 rounded px-2 py-1.5 text-sm pointer-coarse:min-h-11 ${
                    notebookTab === id ? "bg-asphalt-deep text-plate" : "border border-asphalt-deep/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {notebookTab === "quem" ? (
              <ul aria-label="Quem é quem" className="mt-5 space-y-4">
                {whoIsWho.map((group, i) => {
                  // Só aparece depois que a história apresentou o grupo.
                  const known = state && script[state.at].act >= group.act;
                  return (
                    <li key={group.name} className="border-b border-asphalt-deep/20 pb-4">
                      {known ? (
                        <div className="flex items-start gap-4">
                          <LorePhoto
                            src={group.image}
                            name={group.name}
                            focus={group.focus}
                            tilt={i % 2 ? 2 : -2.5}
                            className="mt-2 w-28 shrink-0"
                          />
                          <div>
                            <p className="font-stencil text-xl text-lazarus">{group.name}</p>
                            <p className="text-sm">{group.who}</p>
                            <p className="mt-1 text-xs font-semibold opacity-75">{group.relation}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="font-hand text-2xl opacity-50">· · · ainda não apareceu na história</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ol className="mt-6 space-y-4">
                {acts.map((a) => {
                  const page = found.find((p) => p.title === a.title);
                  return (
                    <li key={a.id} className="border-b border-asphalt-deep/20 pb-3">
                      <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">
                        Ato {a.numeral} · {a.title}
                      </p>
                      <p className="font-hand text-2xl leading-tight">{page ? page.note : "· · ·"}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </aside>
        )}
      </section>
    </LoreSfx.Provider>
  );
}

function Ending({ state, found, onRestart }: { state: StoryState; found: number; onRestart: () => void }) {
  const road = roads.find((r) => r.id === state.road);
  return (
    <div role="group" aria-labelledby="seu-dia-1-jogo" className="mx-auto my-auto w-full max-w-xl text-center">
      <div className="lore-paper rounded-sm px-6 py-10 text-asphalt-deep shadow-2xl">
        <p className="font-hand text-2xl text-asphalt-deep/50">próxima página do caderno</p>
        <h2
          id="seu-dia-1-jogo"
          className="lore-stamp-hit mx-auto mt-3 inline-block rotate-[-4deg] rounded-sm border-[6px] border-lazarus px-6 py-2 font-stencil text-5xl whitespace-nowrap text-lazarus uppercase sm:text-6xl"
        >
          Seu Dia 1
        </h2>
        <p className="mt-5">{dayOne.closing}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
          <div className="rounded border border-asphalt-deep/20 p-3">
            <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">Páginas recuperadas</dt>
            <dd className="font-stencil text-2xl">
              {found}/{acts.length}
            </dd>
          </div>
          <div className="rounded border border-asphalt-deep/20 p-3">
            <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">Sua estrada</dt>
            <dd className="font-stencil text-2xl">{road?.label}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      <p className="mt-5 text-plate/75">
        Prefere sobreviver contra outros jogadores?{" "}
        <Link href="/servidor" className="text-sunset underline hover:text-plate">
          Aliste-se no servidor de guerra
        </Link>
      </p>
      <button type="button" onClick={onRestart} className="mt-3 text-sm text-plate/60 underline hover:text-plate">
        Jogar de novo
      </button>
    </div>
  );
}
