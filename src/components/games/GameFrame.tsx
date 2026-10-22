"use client";

import type { ReactNode } from "react";

export type Phase = "intro" | "playing" | "over" | "skipped";

type Props = {
  title: string;
  intro: ReactNode;
  phase: Phase;
  result?: { title: string; text: string; tone: "good" | "bad" };
  onStart: () => void;
  onSkip: () => void;
  retryLabel?: string;
  onRetry?: () => void;
  shake?: boolean;
  children: ReactNode;
};

/** Moldura comum dos encontros: apresentação, partida, resultado e "pular" sempre à mão. */
export function GameFrame({ title, intro, phase, result, onStart, onSkip, retryLabel, onRetry, shake, children }: Props) {
  return (
    <div className={`relative overflow-hidden rounded border border-rust/50 bg-black ${shake ? "shake" : ""}`}>
      {children}

      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 p-6 text-center">
          <p className="font-stencil text-3xl text-plate">{title}</p>
          <div className="max-w-md text-sm text-plate/80">{intro}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onStart} className="rounded bg-lazarus px-5 py-2 font-semibold text-plate hover:bg-lazarus/85">
              Começar
            </button>
            <button type="button" onClick={onSkip} className="rounded border border-plate/30 px-4 py-2 text-sm text-plate/70 hover:text-plate">
              Pular
            </button>
          </div>
        </div>
      )}

      {phase === "over" && result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
          <h3 className={`font-stencil text-4xl ${result.tone === "good" ? "text-radio" : "text-lazarus"}`}>{result.title}</h3>
          <p className="max-w-md text-sm text-plate/80">{result.text}</p>
          <button type="button" onClick={onRetry} className="rounded border border-plate/40 px-4 py-2 text-sm text-plate hover:border-sunset hover:text-sunset">
            {retryLabel ?? "Tentar de novo"}
          </button>
        </div>
      )}

      {phase === "skipped" && (
        <p className="absolute right-3 bottom-3 rounded bg-black/70 px-2 py-1 text-xs text-plate/60">Você pulou este encontro.</p>
      )}
    </div>
  );
}
