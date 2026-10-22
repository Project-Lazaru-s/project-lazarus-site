"use client";

import { useState } from "react";
import { ambientZombies, ambientZombieCount, skyAt } from "@/lib/survival/scenery";
import { KEY_DAYS, worldAt } from "@/lib/survival/progression";

const SPRITE = { walker: "/images/game/zombie-front.png", runner: "/images/game/zombie-front-runner.png" } as const;

/** Arraste do dia 0 ao 60 e veja o mundo do Project Lazarus apertar. */
export function DaySlider() {
  const [day, setDay] = useState(0);
  const world = worldAt(day);
  const zombies = ambientZombies(day, ambientZombieCount(day));
  const sky = skyAt(day);
  const fresh = new Set(world.fresh.map((e) => e.text));

  return (
    <section aria-labelledby="simulador" className="mx-auto max-w-6xl px-4 pb-16">
      <h2 id="simulador" className="sr-only">
        Simulador de dias
      </h2>
      <div className="rounded border border-rust/40 bg-asphalt p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-stencil text-5xl text-plate">Dia {day}</h3>
          <dl className="grid grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <dt className="text-xs tracking-widest sm:text-[10px] text-plate/50 uppercase">
                Saque nos locais comuns
              </dt>
              <dd className="text-2xl text-sunset">{world.commonLoot}%</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest sm:text-[10px] text-plate/50 uppercase">
                Saque nos locais arriscados
              </dt>
              <dd className="text-2xl text-sunset">{world.riskyLoot}%</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest sm:text-[10px] text-plate/50 uppercase">
                Teto de hostis por perto
              </dt>
              <dd className={world.hostileCap ? "text-2xl text-lazarus" : "pt-2 text-xs text-plate/50"}>
                {world.hostileCap ?? "sem número na tabela"}
              </dd>
            </div>
          </dl>
        </div>

        <label className="mt-6 block">
          <span className="sr-only">Dia</span>
          <input
            type="range"
            min={0}
            max={60}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-full accent-lazarus pointer-coarse:h-8"
          />
        </label>
        <div role="group" aria-label="Dias importantes" className="mt-2 flex flex-wrap gap-1.5">
          {KEY_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={d === day}
              onClick={() => setDay(d)}
              className={`rounded border px-2 py-0.5 font-mono text-xs pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:text-sm ${
                d === day ? "border-sunset text-sunset" : "border-plate/20 text-plate/50 hover:text-plate"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div
          role="img"
          aria-label={`Rua no dia ${day} com ${zombies.length} infectados`}
          className="relative mt-6 h-40 overflow-hidden rounded-sm border border-rust/30 transition-[background] duration-500"
          style={{ background: `linear-gradient(to bottom, ${sky.top}, ${sky.bottom})` }}
        >
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[url('/images/game/city-near.png')] bg-[length:640px_96px] bg-repeat-x opacity-90 pixelated" />
          <div className="absolute inset-x-0 bottom-0 h-3 bg-asphalt-deep" />
          {zombies.map((z, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={z.id}
              src={SPRITE[z.kind]}
              alt=""
              className="absolute bottom-1 h-14 pixelated transition-opacity duration-300"
              style={{ left: `${4 + ((i * 37 + z.lift * 3) % 90)}%` }}
            />
          ))}
        </div>

        <ul aria-label="Ameaças ativas" className="mt-6 grid gap-2 sm:grid-cols-2">
          {world.active.map((event) => (
            <li
              key={event.text}
              className={`flex items-start gap-2 rounded-sm border px-3 py-2 text-sm ${
                fresh.has(event.text) ? "border-lazarus/70 bg-lazarus/10 text-plate" : "border-plate/10 text-plate/70"
              }`}
            >
              <span className="font-mono text-xs text-plate/40">D{event.day}</span>
              <span className="flex-1">{event.text}</span>
              {fresh.has(event.text) && (
                <span className="rounded bg-lazarus px-1.5 text-[10px] font-semibold tracking-widest text-plate uppercase">
                  Novo
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
