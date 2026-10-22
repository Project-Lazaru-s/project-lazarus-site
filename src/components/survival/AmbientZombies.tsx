"use client";

import { useState, type CSSProperties } from "react";
import { ambientZombieCount, ambientZombies, MAX_AMBIENT } from "@/lib/survival/scenery";
import { useSfx, useSurvival } from "./SurvivalProvider";

const SPRITE = { walker: "/images/game/zombie-walk.png", runner: "/images/game/runner-walk.png" } as const;

/**
 * Infectados andando na beirada de baixo da tela, mais a cada dia (tabela de ameaça).
 * Clicar num deles é um abate bônus, mas o barulho atrai mais um.
 */
export function AmbientZombies() {
  const { state, dispatch } = useSurvival();
  const play = useSfx();
  const [down, setDown] = useState<number[]>([]);
  const [drawn, setDrawn] = useState(0);

  const count = Math.min(MAX_AMBIENT + down.length, ambientZombieCount(state.day) + drawn);
  const zombies = ambientZombies(state.day, count);
  const alive = zombies.length - down.filter((id) => id < zombies.length).length;

  const shoot = (id: number) => {
    if (down.includes(id)) return;
    play("headshot", 0.6);
    dispatch({ type: "kill", count: 1 });
    setDown((d) => [...d, id]);
    if (alive <= MAX_AMBIENT) setDrawn((n) => n + 1);
  };

  return (
    <div className="ambient-street pointer-events-none fixed inset-x-0 bottom-0 z-10 h-16 overflow-hidden">
      {zombies.map((z) => {
        const dead = down.includes(z.id);
        const style = {
          "--walk-duration": `${z.duration}s`,
          "--walk-delay": `${z.delay}s`,
          bottom: `${z.lift}px`,
        } as CSSProperties;
        return (
          <button
            key={z.id}
            type="button"
            tabIndex={-1}
            aria-label="Infectado na rua"
            data-dead={dead}
            onClick={() => shoot(z.id)}
            style={style}
            className={`ambient-zombie pointer-events-auto absolute h-12 w-6 cursor-crosshair ${
              z.direction === 1 ? "walk-right" : "walk-left"
            } ${dead ? "ambient-dead" : ""}`}
          >
            <span
              className={`block h-full w-full bg-[length:200%_100%] pixelated ${dead ? "" : "walk-cycle"} ${
                z.direction === -1 ? "-scale-x-100" : ""
              }`}
              style={{ backgroundImage: `url(${dead ? "/images/game/zombie-dead.png" : SPRITE[z.kind]})` }}
            />
          </button>
        );
      })}
    </div>
  );
}
