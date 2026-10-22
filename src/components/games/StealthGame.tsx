"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useSurvival } from "@/components/survival/SurvivalProvider";
import {
  createStealth,
  detection,
  isOnGlass,
  noiseRadius,
  STREET_LENGTH,
  stepStealth,
  TIME_LIMIT,
  type Detection,
  type Gait,
  type StealthState,
} from "@/lib/games/stealth";
import { GameFrame, type Phase } from "./GameFrame";
import { useGameLoop } from "./useGameLoop";

// A rua (street-bg) tem 320x96 px; um sprite de 16x32 ocupa 5% da largura.
// A rua jogável ocupa 84% da cena, então 1 unidade = 0,84% da largura.
const SPRITE_WIDTH = 5;
const UNIT = 84 / STREET_LENGTH;
const toLeft = (x: number) => `${4 + x * UNIT}%`;
/** Diâmetro do anel de ruído relativo à largura do sprite do sobrevivente. */
const ringWidth = (radius: number) => `${((radius * 2 * UNIT) / SPRITE_WIDTH) * 100}%`;

const marker: Record<Detection, { text: string; className: string } | null> = {
  calmo: null,
  atenção: { text: "?", className: "text-sunset" },
  investigando: { text: "??", className: "text-rust-light" },
  avistado: { text: "!", className: "text-lazarus" },
};

const controls: { gait: Gait; label: string; key: string }[] = [
  { gait: "crouch", label: "Agachar", key: "1" },
  { gait: "walk", label: "Andar", key: "2" },
  { gait: "run", label: "Correr", key: "3" },
];

const results = {
  won: { title: "Atravessou", tone: "good" as const },
  spotted: { title: "Avistado", text: "Eles ouviram. Você morreu.", tone: "bad" as const },
  timeout: { title: "Anoiteceu", text: "Parado demais. A noite chegou antes de você.", tone: "bad" as const },
};

export function StealthGame() {
  const { dispatch } = useSurvival();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  const [state, setRendered] = useState(createStealth);
  // Fonte da verdade do loop: vários frames podem rodar antes de um render.
  const live = useRef(state);
  const setState = (next: StealthState) => {
    live.current = next;
    setRendered(next);
  };
  const gait = useRef<Gait>("still");

  const running = phase === "playing" && state.status === "playing";
  useGameLoop((dt) => {
    if (live.current.status !== "playing") return;
    const next = stepStealth(live.current, gait.current, dt);
    setState(next);
    if (next.status === "spotted" || next.status === "timeout") {
      dispatch({ type: "death" });
      dispatch({ type: "fear", amount: 30 });
    }
  }, running);

  const start = () => {
    gait.current = "still";
    setState(createStealth());
    setPhase("playing");
  };

  const onKey = (e: KeyboardEvent, down: boolean) => {
    const control = controls.find((c) => c.key === e.key);
    if (control) gait.current = down ? control.gait : "still";
  };

  const radius = noiseRadius(state.gait, isOnGlass(state.glass, state.x));
  const status = state.status === "playing" ? null : state.status;
  const result =
    status === "won"
      ? { ...results.won, text: `Do outro lado em ${state.time.toFixed(1).replace(".", ",")} s, sem um som a mais.` }
      : status
        ? results[status]
        : undefined;

  return (
    <GameFrame
      title="Silêncio"
      intro={
        <>
          <p>Atravesse a rua até o outro lado. Agachado, quase ninguém te ouve; correndo, todos ouvem. Cuidado com o vidro.</p>
          <p className="mt-2 text-plate/50">Segure 1, 2 ou 3 (ou os botões) para agachar, andar ou correr.</p>
        </>
      }
      phase={phase === "playing" && status ? "over" : phase}
      result={result}
      onStart={start}
      onSkip={() => setPhase("skipped")}
      onRetry={start}
      shake={status === "spotted"}
    >
      <div
        role="application"
        aria-label="Rua com infectados"
        tabIndex={0}
        onKeyDown={(e) => onKey(e, true)}
        onKeyUp={(e) => onKey(e, false)}
        className="relative aspect-[10/3] w-full bg-[url('/images/game/street-bg.png')] bg-cover outline-none pixelated"
      >
        {state.glass.map((g) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={g} src="/images/game/glass.png" alt="" className="absolute bottom-[6%] w-[5%] -translate-x-1/2 pixelated" style={{ left: toLeft(g) }} />
        ))}

        {state.zombies.map((z, i) => {
          const mark = marker[detection(z.awareness)];
          return (
            <div key={i} className="absolute bottom-[6%] w-[5%] -translate-x-1/2" style={{ left: toLeft(z.x) }}>
              {mark && <span className={`absolute -top-6 left-1/2 -translate-x-1/2 font-stencil text-xl ${mark.className}`}>{mark.text}</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/game/zombie-side.png" alt="" className="w-full -scale-x-100 pixelated" />
            </div>
          );
        })}

        <div className="absolute bottom-[6%] -translate-x-1/2" style={{ left: toLeft(state.x), width: "5%" }}>
          {radius > 0 && (
            <span
              aria-hidden
              className={`absolute bottom-0 left-1/2 aspect-[3/1] -translate-x-1/2 translate-y-1/2 rounded-[50%] border ${
                radius > 12 ? "border-lazarus/70" : "border-sunset/50"
              }`}
              style={{ width: ringWidth(radius) }}
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.gait === "crouch" ? "/images/game/survivor-crouch.png" : "/images/game/survivor-side.png"}
            alt="Você"
            className="w-full pixelated"
          />
        </div>

        <div className="absolute inset-x-0 top-0 h-1 bg-black/50">
          <div className="h-full bg-sunset" style={{ width: `${(1 - state.time / TIME_LIMIT) * 100}%` }} />
        </div>
        <span className="sr-only" aria-live="polite">
          {state.zombies.map((z) => detection(z.awareness)).find((d) => d !== "calmo") ?? ""}
        </span>
      </div>

      <div className="flex justify-center gap-2 border-t border-rust/40 bg-asphalt-deep p-2">
        {controls.map((c) => (
          <button
            key={c.gait}
            type="button"
            disabled={!running}
            onPointerDown={() => (gait.current = c.gait)}
            onPointerUp={() => (gait.current = "still")}
            onPointerLeave={() => (gait.current = "still")}
            className="touch-none rounded border border-plate/30 px-3 py-2 text-sm text-plate select-none active:border-sunset active:text-sunset disabled:opacity-40"
          >
            {c.label} <kbd className="ml-1 text-xs text-plate/40">{c.key}</kbd>
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

