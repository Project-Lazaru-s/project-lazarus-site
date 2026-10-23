"use client";

import { useEffect, useState } from "react";

type Props = { acts: { id: string; numeral: string; title: string }[] };

/** Marcador I–V que acompanha a leitura e leva a qualquer ato. */
export function ActNav({ acts }: Props) {
  const [active, setActive] = useState(acts[0].id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // O ato ativo é o que cruza a faixa do meio da tela.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const act of acts) {
      const el = document.getElementById(act.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [acts]);

  return (
    <nav
      aria-label="Atos"
      className="sticky top-[57px] z-30 border-b border-rust/30 bg-asphalt-deep/85 backdrop-blur pointer-coarse:top-[65px]"
    >
      <ol className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2 font-mono text-xs">
        {acts.map((act) => (
          <li key={act.id}>
            <a
              href={`#${act.id}`}
              aria-current={active === act.id ? "location" : undefined}
              title={act.title}
              className={`flex min-h-9 min-w-9 items-center justify-center rounded px-2 transition ${
                active === act.id ? "bg-lazarus font-semibold text-plate" : "text-plate/50 hover:text-plate"
              }`}
            >
              {act.numeral}
              <span className={`ml-2 hidden md:inline ${active === act.id ? "" : "md:hidden"}`}>{act.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
