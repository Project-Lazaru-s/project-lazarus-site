"use client";

import { type ReactNode, useSyncExternalStore } from "react";

export const INSTALL_KEY = "lazarus:install";
const CHANGED = "lazarus:install-changed";

function read(): string {
  try {
    return localStorage.getItem(INSTALL_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parse(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((n): n is number => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

/** Passos de instalação com caixas que ficam marcadas neste navegador. */
export function InstallChecklist({ steps }: { steps: ReactNode[] }) {
  // No servidor nada está marcado; no navegador, o que foi salvo.
  const done = parse(useSyncExternalStore(subscribe, read, () => "[]"));

  const toggle = (index: number) => {
    const next = done.includes(index) ? done.filter((i) => i !== index) : [...done, index].sort();
    try {
      localStorage.setItem(INSTALL_KEY, JSON.stringify(next));
    } catch {
      // Sem armazenamento, a marcação vale só até recarregar.
    }
    window.dispatchEvent(new Event(CHANGED));
  };

  const count = steps.filter((_, i) => done.includes(i)).length;

  return (
    <div>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 pointer-coarse:py-1.5">
              <input
                type="checkbox"
                checked={done.includes(i)}
                onChange={() => toggle(i)}
                className="mt-1 size-4 shrink-0 accent-lazarus pointer-coarse:mt-0 pointer-coarse:size-6"
              />
              <span className={done.includes(i) ? "text-plate/50 line-through" : ""}>{step}</span>
            </label>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-xs text-plate/50">
        <span>
          {count} de {steps.length}
        </span>
        {count === steps.length && <span className="ml-2 text-radio">Pronto para o Dia 0.</span>}
      </p>
    </div>
  );
}
