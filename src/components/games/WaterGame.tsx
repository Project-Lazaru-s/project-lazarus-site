"use client";

import { useRef, useState } from "react";
import { useSurvival } from "@/components/survival/SurvivalProvider";
import { seededRandom } from "@/lib/games/random";
import { drink, DEHYDRATED_AT, pickSources, THIRST_LIMIT, type WaterSource } from "@/lib/games/water";
import type { DrinkOutcome } from "@/lib/survival/survival";
import { GameFrame, type Phase } from "./GameFrame";
import { useGameLoop } from "./useGameLoop";

type Outcome = DrinkOutcome | "fainted";

const INCUBATION = "No jogo, a doença incuba de 3 a 8 minutos e dura 1 a 2 dias de jogo. Antibiótico cura.";

const results: Record<Outcome, { title: string; text: string; tone: "good" | "bad" }> = {
  safe: { title: "Água limpa", text: "Lacrada, segura. Lá dentro, garrafas e latas valem ouro.", tone: "good" },
  sick: { title: "Disenteria", text: `Queasy, depois Sick: o vômito leva comida e água. ${INCUBATION}`, tone: "bad" },
  severe: {
    title: "Disenteria grave",
    text: `Desidratado, a doença vira Severely Sick. ${INCUBATION}`,
    tone: "bad",
  },
  fainted: { title: "Desmaiou de sede", text: "Esperou demais para beber. A sede também mata.", tone: "bad" },
};

export function WaterGame() {
  const { dispatch } = useSurvival();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  // Ordem fixa no prerender; embaralha de verdade ao começar.
  const [sources, setSources] = useState(() => pickSources(seededRandom(3)));
  const [elapsed, setElapsed] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const live = useRef(0);

  const running = phase === "playing" && outcome === null;

  useGameLoop((dt) => {
    live.current += dt;
    setElapsed(live.current);
    if (live.current >= THIRST_LIMIT) {
      setOutcome("fainted");
      dispatch({ type: "death" });
    }
  }, running);

  const start = () => {
    live.current = 0;
    setElapsed(0);
    setOutcome(null);
    setSources(pickSources(Math.random));
    setPhase("playing");
  };

  const choose = (source: WaterSource) => {
    if (!running) return;
    const result = drink(source.id, live.current, Math.random);
    setOutcome(result);
    dispatch({ type: "drink", outcome: result });
  };

  const thirst = Math.min(elapsed / THIRST_LIMIT, 1);
  const dehydrated = elapsed >= DEHYDRATED_AT;

  return (
    <GameFrame
      title="Sede"
      intro={
        <>
          <p>Faz um dia que você não bebe nada. Escolha de onde beber antes de desmaiar.</p>
          <p className="mt-2 text-plate/50">Água de rio, poça ou caldeirão pode trazer disenteria.</p>
        </>
      }
      phase={phase === "playing" && outcome ? "over" : phase}
      result={outcome ? results[outcome] : undefined}
      onStart={start}
      onSkip={() => setPhase("skipped")}
      onRetry={start}
      shake={outcome === "fainted"}
    >
      <div role="application" aria-label="Fontes de água" className="bg-asphalt-deep p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3 font-mono text-xs text-plate/70">
          <span className={dehydrated ? "text-lazarus motion-safe:animate-pulse" : ""}>
            {dehydrated ? "Desidratado" : "Com sede"}
          </span>
          <div className="h-2 flex-1 rounded bg-black/60">
            <div className="h-full rounded bg-sunset transition-[width]" style={{ width: `${thirst * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sources.map((source) => (
            <button
              key={source.id}
              type="button"
              disabled={!running}
              onClick={() => choose(source)}
              className="flex flex-col items-center gap-2 rounded border border-rust/40 bg-asphalt p-4 text-sm text-plate transition hover:border-sunset disabled:opacity-60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/game/water-${source.id}.png`} alt="" className="h-16 w-16 pixelated" />
              {source.label}
            </button>
          ))}
        </div>
      </div>
    </GameFrame>
  );
}
