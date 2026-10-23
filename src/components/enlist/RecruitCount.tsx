import { SIDES } from "@/lib/enlist/enlist";
import { getRecruitStats } from "@/lib/enlist/stats";

/** Contagem pública: só números por lado. */
export async function RecruitCount() {
  const stats = await getRecruitStats();
  if (!stats || stats.total === 0) return null;
  return (
    <section aria-labelledby="alistados" className="rounded-sm border border-rust/40 bg-asphalt p-6">
      <h2 id="alistados" className="font-mono text-xs tracking-[0.3em] text-sunset uppercase">
        Sinais que responderam
      </h2>
      <p className="mt-1 font-stencil text-5xl text-plate">{stats.total}</p>
      <ul className="mt-4 space-y-2">
        {SIDES.map((side) => (
          <li key={side.id} className="text-sm text-plate/80">
            <div className="flex justify-between">
              <span>{side.name}</span>
              <span className="font-mono">{stats.bySide[side.id]}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-sm bg-plate/10">
              <div
                className="h-full rounded-sm bg-lazarus"
                style={{ width: `${(stats.bySide[side.id] / stats.total) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
