/**
 * Camadas fixas por cima da página: a noite cai com os dias (Hardcore True Darkness)
 * e o medo fecha a visão com vinheta. Granulação de filme por cima de tudo.
 */
export function Atmosphere({ day, fear }: { day: number; fear: number }) {
  const night = Math.min(day / 60, 1);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20">
      <div
        className="absolute inset-0 bg-[#05070d] mix-blend-multiply transition-opacity duration-[2000ms]"
        style={{ opacity: night * 0.55 }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: fear / 100,
          background: "radial-gradient(ellipse at center, transparent 45%, rgb(20 0 0 / 0.85) 100%)",
        }}
      />
      <div className="grain absolute inset-0" />
    </div>
  );
}
