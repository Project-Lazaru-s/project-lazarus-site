"use client";

import Image from "next/image";
import { useState } from "react";
import type { Faction } from "@/content/factions";
import { WANTED_AT } from "@/lib/games/negotiation";

/** Posição (%) de um valor de reputação na escala de -100 a +100. */
const onScale = (value: number) => `${((value + 100) / 200) * 100}%`;

/** Carta de facção: perfil na frente, detalhes e reputação no verso. */
export function FactionCard({ faction }: { faction: Faction }) {
  const [flipped, setFlipped] = useState(false);
  const titleId = `faccao-${faction.slug}`;

  return (
    <article
      id={faction.slug}
      aria-labelledby={titleId}
      className="reveal faction-card scroll-mt-24 [perspective:1600px]"
    >
      <div className={`faction-card-inner grid ${flipped ? "is-flipped" : ""}`}>
        <div
          data-face="front"
          inert={flipped}
          className="faction-face rounded border border-rust/40 bg-asphalt p-6 [grid-area:1/1]"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="font-stencil text-3xl text-lazarus">
              {faction.name}
            </h2>
            <button
              type="button"
              aria-pressed={flipped}
              aria-label={`Ver detalhes de ${faction.name}`}
              onClick={() => setFlipped(true)}
              className="shrink-0 rounded border border-plate/20 px-2 py-1 font-mono text-xs pointer-coarse:min-h-11 pointer-coarse:px-3 text-plate/60 hover:border-sunset hover:text-sunset"
            >
              Virar ↻
            </button>
          </div>
          <p className="mt-2 text-plate/85">{faction.profile}</p>
          {faction.image && (
            // No celular as skins ficam pequenas: tocar abre a imagem original em tamanho real.
            <a href={faction.image.src} target="_blank" rel="noopener" className="group/skins relative mt-6 block">
              <Image
                src={faction.image.src}
                alt={faction.image.alt}
                width={faction.image.width}
                height={faction.image.height}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`rounded ${faction.image.illustration ? "" : "[image-rendering:pixelated]"}`}
              />
              <span className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 font-mono text-xs text-plate/80 opacity-0 transition group-hover/skins:opacity-100 pointer-coarse:opacity-100">
                Ampliar ↗
              </span>
            </a>
          )}
        </div>

        <div
          data-face="back"
          inert={!flipped}
          className="faction-face faction-back plate flex flex-col rounded-sm p-6 text-asphalt-deep [grid-area:1/1]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-stencil text-3xl text-lazarus">{faction.name}</p>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="shrink-0 rounded border border-asphalt-deep/30 px-2 py-1 font-mono text-xs pointer-coarse:min-h-11 pointer-coarse:px-3 hover:bg-asphalt-deep/10"
            >
              Voltar
            </button>
          </div>
          <ul className="mt-3 list-[square] space-y-1 pl-5 text-sm">
            {faction.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <p className="font-stencil text-xs tracking-[0.25em]">REPUTAÇÃO</p>
            <div
              role="img"
              aria-label={`Reputação de -100 a +100; procurado em ${WANTED_AT} ou menos`}
              className="relative mt-2 h-3 rounded-sm bg-gradient-to-r from-lazarus via-plate/60 to-grass"
            >
              <span className="absolute -top-1 h-5 w-0.5 bg-asphalt-deep" style={{ left: onScale(WANTED_AT) }} />
              <span className="absolute -top-1 h-5 w-px bg-asphalt-deep/40" style={{ left: onScale(0) }} />
            </div>
            <div className="relative mt-1 h-4 font-mono text-xs sm:text-[10px]">
              <span className="absolute left-0">-100</span>
              <span
                className="absolute -translate-x-1/2 font-semibold text-lazarus"
                style={{ left: onScale(WANTED_AT) }}
              >
                {WANTED_AT} procurado
              </span>
              <span className="absolute right-0">+100</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
