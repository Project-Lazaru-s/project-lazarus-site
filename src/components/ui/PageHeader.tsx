import type { ReactNode } from "react";

// A "placa" da casa: metal branco-gelo, LAZARUS em preto, seção em vermelho.
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-12 pb-8">
      <div className="plate inline-block rounded-sm px-6 py-4">
        <p className="font-stencil text-sm tracking-[0.3em] text-asphalt-deep">LAZARUS</p>
        <h1 className="font-stencil text-4xl text-lazarus sm:text-5xl">{title}</h1>
      </div>
      {children && <div className="mt-6 max-w-3xl text-lg text-plate/80">{children}</div>}
    </header>
  );
}
