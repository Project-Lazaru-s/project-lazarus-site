"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createChase, EXIT, run, stepChase, type ChaseState } from "@/lib/games/chase";
import { useGameLoop } from "./useGameLoop";

// A cena vai de -30 (onde o runner começa, já visível) até a saída.
const FROM = -30;
const toLeft = (position: number) => `${2 + ((Math.max(position, FROM) - FROM) / (EXIT - FROM)) * 84}%`;

/** 404 jogável: você se perdeu e um runner te viu. Corra até a saída. */
export function ChaseGame() {
  const [state, setRendered] = useState<ChaseState | null>(null);
  const live = useRef<ChaseState | null>(null);
  const setState = (next: ChaseState | null) => {
    live.current = next;
    setRendered(next);
  };

  const running = state?.status === "running";

  useGameLoop((dt) => {
    if (live.current?.status === "running") setState(stepChase(live.current, dt));
  }, running);

  const stride = () => {
    if (live.current?.status === "running") setState(run(live.current));
  };

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      e.preventDefault();
      if (live.current?.status === "running") setState(run(live.current));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  return (
    <div className="mt-10 max-w-2xl rounded border border-rust/40 bg-asphalt p-4">
      <div
        role="img"
        aria-label="Você fugindo de um infectado até a saída"
        className="relative h-28 overflow-hidden rounded-sm bg-[url('/images/game/alley-bg.png')] bg-cover pixelated"
      >
        <span className="absolute top-2 right-3 rounded-sm bg-grass px-2 py-0.5 font-stencil text-xs tracking-widest text-plate">
          SAÍDA →
        </span>
        {state && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/game/runner-walk.png"
              alt=""
              className="absolute bottom-1 h-16 w-8 object-cover object-left pixelated"
              style={{ left: toLeft(state.zombie) }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/game/survivor-side.png"
              alt=""
              className="absolute bottom-1 h-16 pixelated"
              style={{ left: toLeft(state.you) }}
            />
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!state && (
          <>
            <p className="flex-1 text-sm text-plate/70">Um runner te viu. Vai ficar aí?</p>
            <button
              type="button"
              onClick={() => setState(createChase())}
              className="rounded bg-lazarus px-4 py-2 text-sm font-semibold text-plate hover:bg-lazarus/85"
            >
              Fugir
            </button>
          </>
        )}
        {running && (
          <button
            type="button"
            onClick={stride}
            className="w-full touch-manipulation rounded bg-lazarus px-4 py-3 font-semibold text-plate select-none active:scale-[0.98]"
          >
            Correr <kbd className="ml-1 text-xs text-plate/60 pointer-coarse:hidden">espaço</kbd>
          </button>
        )}
        {state?.status === "escaped" && (
          <div className="flex-1">
            <h2 className="font-stencil text-2xl text-radio">Você escapou.</h2>
            <Link href="/" className="text-sm text-sunset underline">
              Seguir para o início
            </Link>
          </div>
        )}
        {state?.status === "caught" && (
          <div className="flex flex-1 items-center justify-between gap-3">
            <h2 className="font-stencil text-2xl text-lazarus">Pego.</h2>
            <button
              type="button"
              onClick={() => setState(createChase())}
              className="rounded border border-plate/30 px-3 py-1.5 text-sm text-plate hover:border-sunset"
            >
              Tentar de novo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
