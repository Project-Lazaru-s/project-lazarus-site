"use client";

import { useRef, useState, type MouseEvent } from "react";
import { useSurvival } from "@/components/survival/SurvivalProvider";
import {
  aimJitter,
  createHorde,
  hitPart,
  nextWave,
  seededRandom,
  shoot,
  stepHorde,
  waveSize,
  type HordeState,
  type HordeZombie,
  type ZombieKind,
} from "@/lib/games/horde";
import { GameFrame, type Phase } from "./GameFrame";
import { useGameLoop } from "./useGameLoop";

const SPRITE: Record<ZombieKind, string> = {
  walker: "/images/game/zombie-front.png",
  runner: "/images/game/zombie-front-runner.png",
  soldier: "/images/game/zombie-front-soldier.png",
};
const LABEL: Record<ZombieKind, string> = { walker: "Walker", runner: "Runner", soldier: "Militar blindado" };

const PANIC_DISTANCE = 35; // abaixo disso o medo sobe
const KEYBOARD_AIM = { x: 0.5, y: 0.12 }; // Enter num zumbi focado mira na cabeça

/** Posição em perspectiva: longe = pequeno, perto do horizonte; perto = grande, embaixo. */
function placement(z: HordeZombie) {
  const depth = 1 - Math.min(Math.max(z.distance, 0), 100) / 100;
  return {
    left: `${z.lane * 100}%`,
    bottom: `${38 - depth * 30}%`,
    height: `${18 + depth * 52}%`,
    opacity: z.distance > 100 ? Math.max(0, 1 - (z.distance - 100) / 20) : 1,
    zIndex: Math.round(1000 - z.distance),
  };
}

export function HordeGame() {
  const { state: survival, dispatch } = useSurvival();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  // Cena inicial com semente fixa: o prerender não aceita Math.random.
  const [horde, setRendered] = useState(() => createHorde(1, seededRandom(10)));
  // Fonte da verdade do loop e dos tiros: vários frames podem rodar antes de um render.
  const live = useRef(horde);
  const setHorde = (next: HordeState) => {
    live.current = next;
    setRendered(next);
  };
  const [flash, setFlash] = useState(0);
  const panic = useRef(0);

  const running = phase === "playing" && horde.status === "playing";

  useGameLoop((dt) => {
    if (live.current.status !== "playing") return;
    const next = stepHorde(live.current, dt);
    setHorde(next);
    if (next.status === "breached") {
      dispatch({ type: "death" });
      dispatch({ type: "fear", amount: 40 });
    } else if (next.status === "held") {
      dispatch({ type: "fear", amount: -30 });
    } else if (Math.min(...next.zombies.map((z) => z.distance)) < PANIC_DISTANCE) {
      panic.current += dt;
      if (panic.current >= 0.5) {
        dispatch({ type: "fear", amount: 10 });
        panic.current = 0;
      }
    }
  }, running);

  const fire = (id: number, part: Parameters<typeof shoot>[2]) => {
    const current = live.current;
    if (phase !== "playing" || current.status !== "playing") return;
    const next = shoot(current, id, part, Math.random);
    setFlash((f) => f + 1);
    setHorde(next);
    if (next.kills > current.kills) dispatch({ type: "kill", count: next.kills - current.kills });
  };

  const onZombie = (z: HordeZombie) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const aim =
      e.detail === 0
        ? KEYBOARD_AIM
        : (() => {
            const r = e.currentTarget.getBoundingClientRect();
            return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
          })();
    fire(z.id, hitPart(aim.x, aim.y, aimJitter(survival.fear, Math.random)));
  };

  const start = (wave: "first" | "next") => {
    panic.current = 0;
    setHorde(wave === "next" ? nextWave(live.current, Math.random) : createHorde(1, Math.random));
    setPhase("playing");
  };

  const result =
    horde.status === "held"
      ? {
          title: "Horda contida",
          text: `Próxima horda: ${waveSize(horde.wave + 1)} infectados. Cada horda vem 15% maior.`,
          tone: "good" as const,
        }
      : horde.status === "breached"
        ? { title: "A barricada caiu", text: `Eles entraram na horda ${horde.wave}. Você morreu.`, tone: "bad" as const }
        : undefined;

  return (
    <GameFrame
      title="Contenção"
      intro={
        <>
          <p>A horda vem pela rua. Tiro na cabeça mata; no corpo, precisa de vários. O capacete do militar segura o primeiro.</p>
          <p className="mt-2 text-plate/50">Cada tiro faz barulho e atrai mais deles. O medo treme a sua mira.</p>
        </>
      }
      phase={phase === "playing" && horde.status !== "playing" ? "over" : phase}
      result={result}
      onStart={() => start("first")}
      onSkip={() => setPhase("skipped")}
      retryLabel={horde.status === "held" ? "Próxima horda" : "Tentar de novo"}
      onRetry={() => start(horde.status === "held" ? "next" : "first")}
      shake={horde.status === "breached"}
    >
      <div
        role="application"
        aria-label="Contenção de horda"
        onClick={() => fire(-1, "miss")}
        className="relative aspect-[16/9] w-full cursor-crosshair overflow-hidden bg-[linear-gradient(to_bottom,#0b0d14_0%,#1c1a17_45%,#121212_100%)] select-none"
      >
        <div className="absolute inset-x-0 top-[22%] h-[30%] bg-[url('/images/game/street-bg.png')] bg-cover bg-bottom opacity-70 pixelated" />
        <div className="absolute inset-x-0 bottom-0 h-[8%] bg-[repeating-linear-gradient(90deg,#8a4b2a_0_24px,#6b3a20_24px_48px)] shadow-[0_-4px_12px_rgb(0_0_0/0.6)]" />

        {horde.zombies.map((z) => {
          const place = placement(z);
          return (
            <button
              key={z.id}
              type="button"
              aria-label={`${LABEL[z.kind]} a ${Math.max(0, Math.round(z.distance))} metros`}
              onClick={onZombie(z)}
              className="absolute aspect-[1/2] -translate-x-1/2 cursor-crosshair focus-visible:outline-2 focus-visible:outline-radio"
              style={place}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SPRITE[z.kind]} alt="" draggable={false} className="h-full w-full pixelated" />
            </button>
          );
        })}

        {flash > 0 && running && <div key={flash} aria-hidden className="muzzle-flash pointer-events-none absolute inset-0" />}

        <div className="pointer-events-none absolute top-2 left-3 flex gap-4 font-mono text-xs text-plate/80">
          <span>Horda {horde.wave}</span>
          <span>Munição {horde.ammo}</span>
          <span>Abates {horde.kills}</span>
        </div>
      </div>
    </GameFrame>
  );
}
