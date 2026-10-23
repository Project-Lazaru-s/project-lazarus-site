"use client";

import { useTransition } from "react";
import { removeRecruit } from "@/app/servidor/admin/actions";

/** Apaga uma ficha depois de confirmar; não dá para desfazer. */
export function DeleteRecruit({ id, nick }: { id: number; nick: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Apagar a ficha de ${nick}`}
      onClick={() => {
        if (!confirm(`Apagar a ficha nº ${id} (${nick})? Não dá para desfazer.`)) return;
        start(async () => {
          try {
            await removeRecruit(id);
          } catch {
            alert("Não foi possível apagar a ficha. Tente de novo.");
          }
        });
      }}
      className="rounded border border-lazarus/60 px-2 py-1 text-xs text-lazarus hover:bg-lazarus hover:text-plate disabled:opacity-50"
    >
      {pending ? "Apagando…" : "Apagar"}
    </button>
  );
}
