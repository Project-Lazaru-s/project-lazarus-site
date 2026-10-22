"use client";

import { useSurvival } from "./SurvivalProvider";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Você voltou": continuar a partida salva no navegador ou começar outra. */
export function ResumeBanner() {
  const { saved, resume, newRun } = useSurvival();
  if (!saved) return null;

  const continueRun = () => {
    resume();
    // Leva até a última seção que o sobrevivente já tinha alcançado.
    const sections = [...document.querySelectorAll<HTMLElement>("[data-day]")];
    sections.filter((el) => Number(el.dataset.day) <= saved.day).at(-1)?.scrollIntoView?.({ behavior: "smooth" });
  };

  return (
    <section
      aria-label="Partida salva"
      className="fixed inset-x-4 top-20 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-3 rounded border border-sunset/60 bg-asphalt-deep/95 p-4 shadow-2xl backdrop-blur sm:flex-nowrap"
    >
      <div className="flex-1 text-sm text-plate/80">
        <p className="font-stencil text-lg text-sunset">Você voltou.</p>
        <p>
          Dia {saved.day} · {plural(saved.kills, "abate", "abates")} ·{" "}
          {plural(saved.achievements.length, "conquista", "conquistas")}
        </p>
      </div>
      <button
        type="button"
        onClick={continueRun}
        className="rounded bg-lazarus px-4 py-2 text-sm font-semibold text-plate hover:bg-lazarus/85"
      >
        Continuar
      </button>
      <button
        type="button"
        onClick={newRun}
        className="rounded border border-plate/30 px-4 py-2 text-sm text-plate/80 hover:text-plate"
      >
        Nova partida
      </button>
    </section>
  );
}
