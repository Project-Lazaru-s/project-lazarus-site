"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSfx } from "@/components/survival/SurvivalProvider";
import { radioChannels, typed } from "@/content/radio";

const CHARS_PER_SECOND = 40;
const TICK_MS = 50;

export function Radio() {
  const play = useSfx();
  const [tuned, setTuned] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const channel = radioChannels[tuned];
  const shown = typed(channel.message, elapsed, CHARS_PER_SECOND);
  const done = shown === channel.message;

  useEffect(() => {
    if (done) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => setElapsed((ms) => (reduced ? Infinity : ms + TICK_MS)), TICK_MS);
    return () => clearInterval(id);
  }, [done]);

  const tune = (i: number) => {
    play("radioStatic", 0.5);
    setTuned(i);
    setElapsed(0);
  };

  return (
    <div className="rounded border border-rust/50 bg-black/70 p-4 shadow-[0_0_30px_rgb(85_255_85/0.08)]">
      <div className="flex flex-wrap items-center gap-2" aria-label="Frequências">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/game/radio.png" alt="" className="mr-1 h-10 w-10 pixelated" />
        {radioChannels.map((c, i) => (
          <button
            key={c.frequency}
            type="button"
            aria-pressed={i === tuned}
            onClick={() => tune(i)}
            className={`rounded border px-2 py-1 font-mono text-xs transition ${
              i === tuned ? "border-radio text-radio" : "border-plate/20 text-plate/50 hover:text-plate"
            }`}
          >
            {c.frequency}
          </button>
        ))}
      </div>
      <div role="log" aria-label={`Rádio ${channel.frequency}`} className="mt-3 min-h-20 font-mono text-sm text-radio">
        <span className="sr-only">{channel.message}</span>
        <p aria-hidden>
          {shown}
          {!done && <span className="motion-safe:animate-pulse">▌</span>}
        </p>
      </div>
      {done && (
        <Link href={channel.href} className="mt-2 inline-block text-xs text-plate/60 underline hover:text-plate">
          Saiba mais sobre os eventos
        </Link>
      )}
    </div>
  );
}
