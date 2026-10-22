"use client";

import { useRef, useState } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { createTakedown, markerAt, TAKEDOWN_ROUNDS, tryTakedown } from "@/lib/games/takedown";
import { GameFrame, type Phase } from "./GameFrame";
import { useGameLoop } from "./useGameLoop";

export function TakedownGame() {
  const { dispatch } = useSurvival();
  const play = useSfx();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  const [state, setState] = useState(createTakedown);
  const [marker, setMarker] = useState(0);
  const [bitten, setBitten] = useState(0);
  const clock = useRef(0);

  const round = state.rounds[Math.min(state.results.length, TAKEDOWN_ROUNDS - 1)];
  const running = phase === "playing" && !state.done;

  useGameLoop((dt) => {
    clock.current += dt;
    setMarker(markerAt(clock.current, round.speed));
  }, running);

  const start = () => {
    clock.current = 0;
    setMarker(0);
    setState(createTakedown());
    setPhase("playing");
  };

  const strike = () => {
    if (!running) return;
    const next = tryTakedown(state, markerAt(clock.current, round.speed));
    const hit = next.results.at(-1)!;
    play(hit ? "knifeStab" : "zombieBite");
    dispatch({ type: "takedown", success: hit });
    if (!hit) setBitten((b) => b + 1);
    clock.current = 0;
    setMarker(0);
    setState(next);
  };

  const hits = state.results.filter(Boolean).length;
  const missed = state.results.length - hits;
  const lastMissed = state.results.at(-1) === false;

  return (
    <GameFrame
      title="Por trás"
      intro={
        <>
          <p>Três infectados de costas no beco. Chegue por trás e golpeie no momento certo: um erro e ele se vira.</p>
          <p className="mt-2 text-plate/50">
            <span className="pointer-coarse:hidden">Espaço ou o botão “Golpear”</span>
            <span className="hidden pointer-coarse:inline">Toque em “Golpear”</span> quando o marcador cruzar a faixa
            verde.
          </p>
        </>
      }
      phase={phase === "playing" && state.done ? "over" : phase}
      result={{
        title: `${hits} de ${TAKEDOWN_ROUNDS}`,
        text:
          missed > 0
            ? `Você levou ${missed === 1 ? "uma mordida" : `${missed} mordidas`}. Infecção: só antibiótico cura.`
            : "Três finalizações limpas, sem um som.",
        tone: missed > 0 ? "bad" : "good",
      }}
      onStart={start}
      onSkip={() => setPhase("skipped")}
      onRetry={start}
      shake={lastMissed}
    >
      <div
        role="application"
        aria-label="Beco com infectados de costas"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
            strike();
          }
        }}
        className="relative aspect-[16/9] sm:aspect-[10/3] w-full bg-[url('/images/game/alley-bg.png')] bg-cover outline-none pixelated"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/game/zombie-back.png"
          alt=""
          className="absolute bottom-[6%] left-[55%] w-[8%] sm:w-[5%] pixelated"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/game/survivor-knife.png"
          alt="Você"
          className="absolute bottom-[6%] w-[8%] sm:w-[5%] pixelated transition-[left] duration-300"
          style={{ left: `${20 + (state.results.length / TAKEDOWN_ROUNDS) * 25}%` }}
        />
        {bitten > 0 && lastMissed && (
          <div
            key={bitten}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-lazarus/30 motion-safe:animate-pulse"
          />
        )}
        <span className="absolute top-2 left-3 font-mono text-xs text-plate/80">
          Infectado {Math.min(state.results.length + 1, TAKEDOWN_ROUNDS)} de {TAKEDOWN_ROUNDS}
        </span>
      </div>

      <div className="flex items-center gap-3 border-t border-rust/40 bg-asphalt-deep p-3">
        <div className="relative h-4 flex-1 rounded bg-black/60" aria-hidden>
          <div
            className="absolute inset-y-0 rounded bg-grass/80"
            style={{ left: `${(0.5 - round.window / 2) * 100}%`, width: `${round.window * 100}%` }}
          />
          <div className="absolute inset-y-[-3px] w-1 -translate-x-1/2 bg-plate" style={{ left: `${marker * 100}%` }} />
        </div>
        <button
          type="button"
          disabled={!running}
          onClick={strike}
          className="rounded bg-lazarus px-4 py-2 text-sm font-semibold text-plate hover:bg-lazarus/85 disabled:opacity-40"
        >
          Golpear
        </button>
      </div>
    </GameFrame>
  );
}
