"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SoundButton, useSoundPref } from "@/components/lore/game/sound";
import { ART } from "@/lib/enlist/art";
import { DIAL, STATIONS, staticky, tune } from "@/lib/enlist/dial";
import type { SideId } from "@/lib/enlist/enlist";
import { createSfx, type Sfx, type SoundName } from "@/lib/survival/sfx";

/** Minigame do alistamento: girar o dial até achar uma das três facções e responder ao chamado. */
export function RadioDial({ onAnswer }: { onAnswer: (side: SideId) => void }) {
  const [soundOn, setSoundOn] = useSoundPref();
  const sfxRef = useRef<Sfx>(null);
  const play = (name: SoundName, volume: number) =>
    soundOn && (sfxRef.current ??= createSfx(typeof Audio === "undefined" ? undefined : Audio)).play(name, volume);
  const lastStatic = useRef(0);
  const [freq, setFreq] = useState(DIAL.start);
  const [found, setFound] = useState<SideId[]>([]);
  const { station, strength, locked } = tune(freq);

  return (
    <div
      role="group"
      aria-label="Rádio de recrutamento"
      className="rounded border border-radio/30 bg-black/90 p-5 font-mono text-radio shadow-2xl sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 text-xs text-radio/60">
        <span>{locked ? "SINAL CAPTADO" : "PROCURANDO SINAL…"}</span>
        <SoundButton on={soundOn} onChange={setSoundOn} />
      </div>
      <p className="mt-3 text-center font-stencil text-5xl tracking-wider text-radio sm:text-6xl" aria-hidden>
        {freq.toFixed(1)}
        <span className="ml-2 text-base text-radio/60">MHz</span>
      </p>

      <label className="mt-4 block text-xs text-radio/60">
        Frequência
        <input
          type="range"
          min={DIAL.min}
          max={DIAL.max}
          step={DIAL.step}
          value={freq}
          aria-valuetext={`${freq.toFixed(1)} MHz`}
          onChange={(e) => {
            const next = Number(e.target.value);
            setFreq(next);
            const t = tune(next);
            if (t.locked && !found.includes(t.station.id)) {
              play("loreRadioTuned", 0.7);
              setFound([...found, t.station.id]);
            } else if (!t.locked && e.timeStamp - lastStatic.current > 450) {
              lastStatic.current = e.timeStamp;
              play("radioStatic", 0.15 + (1 - t.strength) * 0.3);
            }
          }}
          className="mt-2 block w-full accent-radio pointer-coarse:h-8"
        />
      </label>
      <p className="sr-only">Há três facções transmitindo: em 87.3, 104.1 e 121.5 MHz.</p>
      <div aria-hidden className="mt-2 flex h-2 gap-0.5">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={`flex-1 rounded-sm ${i / 24 < strength ? "bg-radio" : "bg-radio/15"}`} />
        ))}
      </div>
      <p className="mt-2 text-xs text-radio/50">
        Sinais encontrados: {found.length}/{STATIONS.length}
      </p>

      <div aria-live="polite" className="mt-4 min-h-32">
        {locked ? (
          <div className="lore-broadcast">
            <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
              <Image
                src={ART[station.id].scene}
                alt=""
                fill
                sizes="(min-width: 1024px) 40rem, 100vw"
                className="object-cover"
              />
              {ART[station.id].emblem && (
                <Image
                  src={ART[station.id].emblem!}
                  alt=""
                  width={96}
                  height={96}
                  className="absolute right-3 bottom-3 size-16 drop-shadow-lg sm:size-24"
                />
              )}
            </div>
            <p className="mt-3 text-sm text-radio/70">{station.name.toUpperCase()}</p>
            <p className="mt-1 text-base text-plate">“{station.call}”</p>
            <button
              type="button"
              onClick={() => {
                play("loreRadioOff", 0.6);
                onAnswer(station.id);
              }}
              className="mt-4 w-full rounded bg-lazarus px-6 py-3 font-sans font-semibold text-plate hover:bg-lazarus/85 focus-visible:outline-2 focus-visible:outline-sunset"
            >
              Responder ao chamado da {station.freq.toFixed(1)}
            </button>
          </div>
        ) : (
          <p aria-hidden className="text-lg break-words">
            {staticky(station.call, strength)}
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-radio/20 pt-4 text-center font-sans text-sm text-plate/70">
        Prefere não responder a ninguém?{" "}
        <button type="button" onClick={() => onAnswer("solo")} className="text-sunset underline hover:text-plate">
          Seguir como lobo solitário
        </button>
      </div>
    </div>
  );
}
