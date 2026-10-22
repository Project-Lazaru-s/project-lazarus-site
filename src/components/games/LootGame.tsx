"use client";

import { useState } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { items } from "@/content/items";
import { openCabinet } from "@/lib/games/loot";
import { lootForDay, type Item } from "@/lib/survival/survival";
import { GameFrame, type Phase } from "./GameFrame";

const CABINETS = 3;
type Opened = { item: Item | null } | null;

export function LootGame() {
  const { state: survival, dispatch } = useSurvival();
  const play = useSfx();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  const [cabinets, setCabinets] = useState<Opened[]>(() => Array(CABINETS).fill(null));
  const loot = lootForDay(survival.day);
  const done = cabinets.every(Boolean);

  const start = () => {
    setCabinets(Array(CABINETS).fill(null));
    setPhase("playing");
  };

  const open = (index: number) => {
    if (phase !== "playing" || cabinets[index]) return;
    const item = openCabinet(loot, Math.random);
    play("cabinetSearch");
    dispatch({ type: "loot", item });
    setCabinets((all) => all.map((c, i) => (i === index ? { item } : c)));
  };

  const found = cabinets.flatMap((c) => (c?.item ? [items[c.item].label] : []));

  return (
    <GameFrame
      title="Farmácia"
      intro={
        <>
          <p>Uma farmácia já saqueada. Três armários ainda fechados. Talvez sobrou um antibiótico.</p>
          <p className="mt-2 text-plate/50">Hoje, cada armário tem {loot}% de chance de ter algo.</p>
        </>
      }
      phase={phase === "playing" && done ? "over" : phase}
      result={{
        title: found.length ? "Algo sobrou" : "Nada",
        text: found.length
          ? `Você levou: ${found.join(", ")}. Com ${loot}% de saque, foi sorte.`
          : `Chegou tarde. No dia ${survival.day}, o saque é ${loot}% do que era.`,
        tone: found.length ? "good" : "bad",
      }}
      onStart={start}
      onSkip={() => setPhase("skipped")}
      onRetry={start}
      retryLabel="Saquear outra farmácia"
    >
      <div
        role="application"
        aria-label="Farmácia saqueada"
        className="relative grid aspect-[10/3] w-full grid-cols-3 items-end gap-[8%] bg-[url('/images/game/pharmacy-bg.png')] bg-cover px-[14%] pb-[6%] pixelated"
      >
        {cabinets.map((cabinet, i) => (
          <button
            key={i}
            type="button"
            disabled={phase !== "playing" || cabinet !== null}
            onClick={() => open(i)}
            aria-label={cabinet ? undefined : `Abrir armário ${i + 1}`}
            className="relative flex flex-col items-center text-xs text-plate disabled:cursor-default"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cabinet ? "/images/game/chest-open.png" : "/images/game/chest-closed.png"}
              alt=""
              className="w-full max-w-24 pixelated"
            />
            {cabinet && (
              <span className="absolute -top-8 flex items-center gap-1 rounded bg-black/80 px-2 py-1 whitespace-nowrap">
                {cabinet.item ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={items[cabinet.item].icon} alt="" className="h-5 w-5 pixelated" />
                    {items[cabinet.item].label}
                  </>
                ) : (
                  <span className="text-plate/50">Vazio</span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
