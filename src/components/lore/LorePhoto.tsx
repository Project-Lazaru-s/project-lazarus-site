"use client";

import Image from "next/image";
import { useRef } from "react";

type Props = { src: string; name: string; focus: string; tilt: number; className?: string };

/** Foto colada no caderno, recortada nos personagens; tocar abre a cena inteira, em cores. */
export function LorePhoto({ src, name, focus, tilt, className = "" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label={`Ampliar a cena: ${name}`}
        onClick={() => dialog.current?.showModal()}
        style={{ rotate: `${tilt}deg` }}
        className={`lore-photo block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-rust ${className}`}
      >
        <span className="relative block aspect-[4/3] overflow-hidden">
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 640px) 20rem, 60vw"
            className="scale-125 object-cover"
            style={{ objectPosition: focus, transformOrigin: focus }}
          />
        </span>
      </button>
      <dialog
        ref={dialog}
        aria-label={name}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto max-w-5xl bg-transparent p-0 backdrop:bg-black/80"
      >
        <figure className="bg-[#f4f1e8] p-2 shadow-2xl">
          <Image src={src} alt="" width={1672} height={941} sizes="(min-width: 1024px) 64rem, 100vw" />
          <figcaption className="mt-2 flex items-center justify-between px-1 font-stencil text-xl text-asphalt-deep">
            {name}
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded border border-asphalt-deep/30 px-3 py-1 font-mono text-xs hover:bg-asphalt-deep/10"
            >
              Fechar
            </button>
          </figcaption>
        </figure>
      </dialog>
    </>
  );
}
