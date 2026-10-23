"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 22;

/** Uma fala, escrita letra por letra. O primeiro toque completa a fala; o segundo avança. */
export function Dialogue({ text, quote, onNext }: { text: string; quote?: boolean; onNext: () => void }) {
  const [shown, setShown] = useState(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? text.length : 0,
  );
  const typing = shown < text.length;

  useEffect(() => {
    if (!typing) return;
    const id = setInterval(() => setShown((n) => Math.min(n + 2, text.length)), TYPE_MS);
    return () => clearInterval(id);
  }, [typing, text.length]);

  return (
    <div className="mx-auto w-full max-w-3xl rounded border border-plate/20 bg-asphalt-deep/90 p-5 shadow-2xl backdrop-blur sm:p-6">
      <p
        className={
          quote ? "font-stencil text-2xl leading-snug text-plate sm:text-3xl" : "text-lg leading-relaxed text-plate/90"
        }
      >
        <span className="sr-only">{text}</span>
        <span aria-hidden>
          {text.slice(0, shown)}
          <span className="invisible">{text.slice(shown)}</span>
        </span>
      </p>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          autoFocus
          onClick={() => (typing ? setShown(text.length) : onNext())}
          className="rounded border border-plate/30 px-4 py-2 font-mono text-sm text-plate/80 hover:border-sunset hover:text-sunset pointer-coarse:min-h-11"
        >
          Continuar <span className={typing ? "opacity-30" : "lore-blink"}>▸</span>
        </button>
      </div>
    </div>
  );
}
