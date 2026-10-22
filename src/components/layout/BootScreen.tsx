"use client";

import { useEffect, useSyncExternalStore } from "react";
import { loadingTips } from "@/content/tips";
import { BOOT_MS } from "./boot";

// Uma dica por carregamento, sorteada só no navegador (no servidor é sempre a primeira).
let clientTip: number | undefined;
const tipIndex = () => (clientTip ??= Math.floor(Math.random() * loadingTips.length));
const noSubscription = () => () => {};

function finish() {
  document.documentElement.removeAttribute("data-boot");
}

/** "Gerando mundo…": aparece só quando o <html> tem data-boot (ver bootScript). */
export function BootScreen() {
  const tip = loadingTips[useSyncExternalStore(noSubscription, tipIndex, () => 0)];

  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-boot")) return;
    const id = setTimeout(finish, BOOT_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="boot-screen pointer-events-none fixed inset-0 z-[100] flex-col items-center justify-center gap-6 bg-asphalt-deep px-6 text-center">
      <p className="font-stencil text-sm tracking-[0.5em] text-sunset">PROJECT</p>
      <p className="-mt-6 font-stencil text-6xl text-lazarus sm:text-8xl">LAZARUS</p>
      <p className="font-mono text-sm text-plate/70">Gerando mundo…</p>
      <div className="h-2 w-64 overflow-hidden rounded-sm border border-rust/60 bg-black/60">
        <div className="boot-progress h-full bg-lazarus" />
      </div>
      <p className="max-w-sm text-sm text-plate/60">{tip}</p>
      <button
        type="button"
        onClick={finish}
        className="pointer-events-auto rounded border border-plate/30 px-3 py-1 font-mono text-xs text-plate/60 hover:text-plate"
      >
        Pular
      </button>
    </div>
  );
}
