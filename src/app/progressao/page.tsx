import type { Metadata } from "next";
import { DaySlider } from "@/components/progression/DaySlider";
import { PageHeader } from "@/components/ui/PageHeader";
import { progression } from "@/content/progression";

export const metadata: Metadata = {
  title: "Progressão",
  description: "Cada dia é mais difícil que o anterior: a escalada de ameaças e a queda do saque.",
};

export default function ProgressionPage() {
  return (
    <>
      <PageHeader title="Progressão">
        <p>
          Cada dia é mais difícil que o anterior. O jogo começa mediano e aperta em degraus até o dia 60, sem virar
          frustração e sem ficar entediante.
        </p>
      </PageHeader>
      <DaySlider />
      <ol aria-label="Linha do tempo da dificuldade" className="mx-auto max-w-6xl px-4 pb-20 *:max-w-[min(100%,48rem)]">
        {progression.map((stage) => (
          <li
            key={stage.from}
            aria-label={stage.label}
            className="reveal relative border-l-2 border-rust/60 pb-10 pl-8 last:pb-0"
          >
            <span
              aria-hidden
              className="absolute top-1 -left-[9px] size-4 rounded-full border-2 border-asphalt-deep bg-lazarus"
            />
            <h2 className="font-stencil text-2xl text-sunset">{stage.label}</h2>
            <ul className="mt-2 space-y-1 text-plate/85">
              {stage.threats.map((threat) => (
                <li key={threat}>{threat}</li>
              ))}
            </ul>
            {stage.loot && (
              <p className="mt-3 inline-block rounded bg-badge/60 px-3 py-1 text-sm text-plate">Saque: {stage.loot}</p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
