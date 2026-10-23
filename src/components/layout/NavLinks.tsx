"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { modpackMenu, topNav } from "@/content/site";

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Item ativo: sublinhado fino em vez de só cor (o laranja se confundia com o botão de baixar).
const item = (active: boolean) =>
  `relative py-1 text-sm transition hover:text-plate after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-sunset after:transition ${
    active ? "text-plate after:opacity-100" : "text-plate/70 after:opacity-0"
  }`;

/** Barra do topo no desktop: menu "O modpack" (disclosure, não role=menu) e três links. */
export function DesktopNav({ className }: { className: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLLIElement>(null);
  const panelId = useId();
  const inModpack = modpackMenu.some((i) => isActive(pathname, i.href));

  // Fecha ao clicar fora do menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <nav aria-label="Navegação principal" className={className}>
      <ul className="flex items-center gap-7">
        <li
          ref={box}
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          onBlur={(e) => !box.current?.contains(e.relatedTarget as Node) && setOpen(false)}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            data-active={inModpack || undefined}
            onClick={() => setOpen(!open)}
            className={`${item(inModpack)} flex items-center gap-1`}
          >
            O modpack
            <span aria-hidden className={`text-[10px] transition ${open ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {/* pt-3 em vez de margem: o mouse atravessa o vão sem fechar o menu. */}
          <div id={panelId} hidden={!open} className="absolute top-full left-1/2 w-72 -translate-x-1/2 pt-3">
            <ul className="rounded border border-rust/40 bg-asphalt p-2 shadow-2xl">
              {modpackMenu.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block rounded px-3 py-2 transition hover:bg-black/30 ${active ? "bg-black/30" : ""}`}
                    >
                      <span className={`block text-sm ${active ? "text-sunset" : "text-plate"}`}>{link.label}</span>
                      <span className="block text-xs text-plate/55">{link.description}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </li>
        {topNav.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={active ? "page" : undefined} className={item(active)}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
