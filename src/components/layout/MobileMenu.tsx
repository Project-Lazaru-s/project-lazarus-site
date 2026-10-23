"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { navGroups, site } from "@/content/site";
import { isActive } from "./NavLinks";

/** Menu do celular: gaveta em tela cheia num <dialog> nativo (Esc, foco e fundo inerte de graça). */
export function MobileMenu() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="ml-auto rounded border border-plate/30 px-3 py-1 text-sm text-plate pointer-coarse:px-4 pointer-coarse:py-2.5 lg:hidden"
      >
        Menu
      </button>
      <dialog
        ref={dialog}
        aria-label="Menu"
        // Toque fora do painel (no próprio <dialog>, que ocupa a tela) ou num link fecha o menu.
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest("a")) close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(20rem,85vw)] max-w-none bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col border-l border-rust/40 bg-asphalt px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="font-stencil text-xl tracking-wider text-plate">
              Project <span className="text-lazarus">Lazarus</span>
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar menu"
              className="flex size-11 items-center justify-center rounded border border-plate/30 text-xl text-plate"
            >
              ×
            </button>
          </div>
          <nav aria-label="Navegação móvel" className="mt-4 flex-1 space-y-6 overflow-y-auto">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`block py-1 font-stencil text-2xl ${pathname === "/" ? "text-sunset" : "text-plate"}`}
            >
              Início
            </Link>
            {navGroups.map((group, g) => (
              <div key={group.title}>
                <p id={`menu-grupo-${g}`} className="font-mono text-[11px] tracking-[0.25em] text-plate/45 uppercase">
                  {group.title}
                </p>
                <ul aria-labelledby={`menu-grupo-${g}`} className="mt-1">
                  {group.items.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={`block border-b border-rust/20 py-2.5 font-stencil text-xl ${active ? "text-sunset" : "text-plate"}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <Link
            href="/baixar"
            className="mt-4 block rounded bg-lazarus px-4 py-3 text-center font-semibold text-plate hover:bg-lazarus/85"
          >
            Baixar {site.version}
          </Link>
        </div>
      </dialog>
    </>
  );
}
