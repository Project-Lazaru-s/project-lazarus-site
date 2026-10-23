import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { isAdmin } from "@/lib/enlist/admin";
import { connect, listRecruits } from "@/lib/enlist/db";
import { EXPERIENCE, PLAYTIMES, REGIONS, SIDES } from "@/lib/enlist/enlist";

export const metadata: Metadata = { title: "Fichas", robots: { index: false, follow: false } };

const label = (list: readonly { id: string; label?: string; name?: string }[], id: unknown) => {
  const item = list.find((i) => i.id === id);
  return item?.label ?? item?.name ?? String(id ?? "");
};
const date = (value: unknown) =>
  new Date(value as string).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });

async function Recruits() {
  if (!isAdmin((await headers()).get("authorization"))) notFound();
  const sql = connect();
  if (!sql) return <p className="text-plate/75">Banco não configurado neste ambiente.</p>;
  const rows = await listRecruits(sql);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-plate/80">
          <span className="font-stencil text-3xl text-plate">{rows.length}</span> fichas
        </p>
        <a
          href="/servidor/admin/fichas.csv"
          download
          className="rounded bg-lazarus px-5 py-3 font-semibold text-plate hover:bg-lazarus/85"
        >
          Exportar CSV
        </a>
      </div>
      <div className="mt-6 overflow-x-auto rounded-sm border border-rust/40">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-asphalt font-mono text-xs tracking-wider text-sunset uppercase">
            <tr>
              {["Nº", "Nick", "E-mail", "WhatsApp", "Discord", "Lado", "Experiência", "Região", "Horário", "Data"].map(
                (h) => (
                  <th key={h} scope="col" className="px-3 py-2">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-plate/10 text-plate/85">
            {rows.map((r) => (
              <tr key={r.id as number}>
                <td className="px-3 py-2 font-mono">{r.id as number}</td>
                <td className="px-3 py-2 font-semibold">{r.nick as string}</td>
                <td className="px-3 py-2">
                  <a href={`mailto:${r.email}`} className="underline hover:text-sunset">
                    {r.email as string}
                  </a>
                </td>
                <td className="px-3 py-2">
                  {r.whatsapp ? (
                    <a
                      href={`https://wa.me/${(r.whatsapp as string).slice(1)}`}
                      target="_blank"
                      rel="noopener"
                      className="underline hover:text-sunset"
                    >
                      {r.whatsapp as string}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">{(r.discord as string) ?? "—"}</td>
                <td className="px-3 py-2">{label(SIDES, r.side)}</td>
                <td className="px-3 py-2">{label(EXPERIENCE, r.experience)}</td>
                <td className="px-3 py-2">{label(REGIONS, r.region)}</td>
                <td className="px-3 py-2">{label(PLAYTIMES, r.playtime)}</td>
                <td className="px-3 py-2">{date(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Fichas" />
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <Suspense fallback={<p className="text-plate/60">Abrindo o arquivo…</p>}>
          <Recruits />
        </Suspense>
      </div>
    </>
  );
}
