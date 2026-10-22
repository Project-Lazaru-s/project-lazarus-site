"use client";

import Link from "next/link";
import { useState } from "react";
import { ACHIEVEMENTS } from "@/lib/survival/achievements";
import { encodeRun } from "@/lib/survival/runCode";
import { shareText } from "@/lib/survival/survival";
import { DossierCard } from "./DossierCard";
import { useSurvival } from "./SurvivalProvider";

/** Dossiê da partida atual, com link compartilhável que gera um cartão (/dossie/[code]). */
export function Dossier() {
  const { state, newRun } = useSurvival();
  const [shared, setShared] = useState(false);
  const path = `/dossie/${encodeRun(state)}`;
  const unlocked = new Set(state.achievements);

  const share = async () => {
    const text = shareText(state, `${window.location.origin}${path}`);
    if (navigator.share) await navigator.share({ text }).catch(() => {});
    else await navigator.clipboard?.writeText(text);
    setShared(true);
  };

  const startOver = () => {
    newRun();
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <DossierCard state={state}>
        <button
          type="button"
          onClick={share}
          className="rounded bg-asphalt-deep px-4 py-2 text-sm font-semibold text-plate hover:bg-asphalt"
        >
          Compartilhar
        </button>
        <Link href={path} className="text-sm underline hover:text-lazarus">
          Ver cartão
        </Link>
        <button type="button" onClick={startOver} className="text-sm underline hover:text-lazarus">
          Nova partida
        </button>
        {shared && (
          <span role="status" className="text-sm">
            Copiado. Desafie alguém.
          </span>
        )}
      </DossierCard>

      <section aria-labelledby="conquistas" className="rounded border border-rust/40 bg-black/30 p-4">
        <div className="flex items-baseline justify-between">
          <h3 id="conquistas" className="font-stencil text-xl text-plate">
            Conquistas
          </h3>
          <span className="font-mono text-sm text-sunset">
            {unlocked.size} de {ACHIEVEMENTS.length}
          </span>
        </div>
        <ul aria-label="Conquistas" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const done = unlocked.has(a.id);
            return (
              <li
                key={a.id}
                data-unlocked={done}
                title={a.description}
                className={`flex flex-col items-center gap-1 rounded-sm border p-2 text-center ${
                  done ? "border-sunset/70 bg-sunset/10" : "border-plate/10 opacity-50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.icon} alt="" className={`h-8 w-8 object-contain pixelated ${done ? "" : "grayscale"}`} />
                <span className="text-[10px] leading-tight text-plate/80">{a.title}</span>
                <span className="sr-only">{done ? "Desbloqueada" : "Bloqueada"}: {a.description}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
