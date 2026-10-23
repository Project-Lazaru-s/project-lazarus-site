"use client";

import Link from "next/link";
import { useState } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { highlights } from "@/content/home";
import { createLock, forceLock, isPinSet, LOCKPICKS, pickPin, PINS } from "@/lib/games/lockpick";
import { seededRandom } from "@/lib/games/random";

const FORCE_FEAR = 30; // arrombar faz barulho

export function ChestGame() {
  const { dispatch } = useSurvival();
  const play = useSfx();
  const [picking, setPicking] = useState(false);
  // Cadeado inicial com semente fixa (prerender); embaralha de verdade ao usar a gazua.
  const [lock, setLock] = useState(() => createLock(seededRandom(7)));
  const [shake, setShake] = useState(0);

  const opened = lock.status === "open" || lock.status === "forced";

  const startPicking = () => {
    setLock(createLock(Math.random));
    setPicking(true);
  };

  const touch = (pin: number) => {
    const next = pickPin(lock, pin);
    if (next === lock) return;
    setLock(next);
    if (next.status === "open") {
      play("chestOpen");
      dispatch({ type: "chest", method: "picked", broken: LOCKPICKS - next.picks });
    } else if (next.lastWrong !== null) {
      play("lockpickBreak");
      setShake((s) => s + 1);
    } else play("lockPin");
  };

  const force = () => {
    setLock(forceLock(lock));
    dispatch({ type: "fear", amount: FORCE_FEAR });
    dispatch({ type: "chest", method: "forced", broken: 0 });
    play("chestOpen");
  };

  const message =
    lock.status === "jammed"
      ? "Sem gazuas. A fechadura emperrou."
      : lock.lastWrong !== null
        ? "A gazua quebrou. Os pinos caíram."
        : lock.set > 0
          ? "Click. Esse ficou."
          : "Encontre a ordem dos pinos.";

  return (
    <div className="space-y-8">
      {!opened && (
        <div className="flex flex-col items-center gap-6 rounded border border-rust/40 bg-asphalt p-6 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/game/chest-big-closed.png"
            alt="Baú trancado"
            className="w-32 shrink-0 pixelated drop-shadow-[0_8px_16px_rgb(0_0_0/0.6)]"
          />
          <div className="w-full space-y-4">
            {!picking ? (
              <p className="text-plate/80">
                Um baú trancado no porão de uma casa saqueada. O cadeado ainda segura. O que tem dentro mostra o que te
                espera no Project Lazarus.
              </p>
            ) : (
              <div
                role="group"
                aria-label="Cadeado"
                key={shake}
                className={`flex items-center gap-5 ${shake ? "shake" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/game/padlock.png" alt="" className="hidden w-20 pixelated sm:block" />
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    {Array.from({ length: PINS }, (_, pin) => {
                      const up = isPinSet(lock, pin);
                      return (
                        <button
                          key={pin}
                          type="button"
                          aria-label={`Pino ${pin + 1}`}
                          aria-pressed={up}
                          disabled={lock.status !== "picking"}
                          onClick={() => touch(pin)}
                          className="group flex h-20 w-10 flex-col justify-end rounded-sm border border-plate/20 bg-black/60 p-1 hover:border-sunset disabled:opacity-50"
                        >
                          <span
                            className={`block h-10 w-full rounded-sm transition-transform duration-150 ${
                              up ? "-translate-y-8 bg-[#c9a24a]" : "bg-plate/40 group-hover:bg-plate/60"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-mono text-xs text-plate/60" aria-live="polite">
                    {message}
                  </p>
                  <p className="flex items-center gap-1 font-mono text-xs text-plate/80">
                    {Array.from({ length: lock.picks }, (_, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img key={i} src="/images/game/lockpick.png" alt="" className="h-5 w-5 pixelated" />
                    ))}
                    <span className="ml-1">Gazuas: {lock.picks}</span>
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {!picking && (
                <button
                  type="button"
                  onClick={startPicking}
                  className="rounded bg-rust px-4 py-2 font-semibold text-plate hover:bg-rust-light"
                >
                  Usar gazua
                </button>
              )}
              <button
                type="button"
                onClick={force}
                className="rounded border border-lazarus px-4 py-2 text-lazarus hover:bg-lazarus/10"
              >
                Arrombar (barulhento)
              </button>
            </div>
          </div>
        </div>
      )}

      {opened && (
        <div className="chest-interior relative rounded-md p-5 sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/game/chest-big-open.png" alt="Baú aberto" className="w-16 pixelated" />
            <p className="font-stencil text-sm tracking-[0.3em] text-sunset uppercase">
              {lock.status === "forced" ? "Arrombado. Algo ouviu." : "Aberto sem um som."}
            </p>
          </div>
          <ul aria-label="Conteúdo do baú" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight, i) => (
              <li key={highlight.title} className="loot-rise" style={{ animationDelay: `${i * 110}ms` }}>
                <Link
                  href={highlight.href}
                  className="group flex h-full gap-4 rounded border border-rust/60 bg-asphalt-deep/80 p-4 shadow-[inset_0_0_0_1px_rgb(232_226_208/0.04)] transition hover:-translate-y-1 hover:border-sunset"
                >
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-sm border-2 border-rust bg-black/60 shadow-[inset_0_2px_8px_rgb(0_0_0/0.8)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={highlight.icon} alt="" className="h-12 w-12 object-contain pixelated" />
                  </span>
                  <span>
                    <span className="block font-stencil text-xl text-lazarus group-hover:text-sunset">
                      {highlight.title}
                    </span>
                    <span className="mt-1 block text-sm text-plate/75">{highlight.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
