"use client";

import { useState } from "react";

const FEEDBACK_MS = 2000;

/** Copia uma linha de configuração para a área de transferência. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), FEEDBACK_MS);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${text} copiado` : `Copiar ${text}`}
      className={`ml-1 rounded border px-1.5 py-0.5 font-mono text-[10px] align-middle transition ${
        copied ? "border-radio/60 text-radio" : "border-plate/20 text-plate/50 hover:border-sunset hover:text-sunset"
      }`}
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}
