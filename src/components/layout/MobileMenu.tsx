"use client";

import { useRef } from "react";
import { NavLinks } from "./NavLinks";

/** Menu do celular: gaveta em tela cheia num <dialog> nativo (Esc, foco e fundo inerte de graça). */
export function MobileMenu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="ml-auto rounded border border-plate/30 px-3 py-1 text-sm text-plate pointer-coarse:px-4 pointer-coarse:py-2.5 xl:hidden"
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
          <NavLinks
            className="mt-6 flex flex-col"
            linkClassName="block border-b border-rust/30 py-3 font-stencil text-2xl"
            label="Navegação móvel"
          />
        </div>
      </dialog>
    </>
  );
}
