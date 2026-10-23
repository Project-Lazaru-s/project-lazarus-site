import type { CSSProperties } from "react";
import { gangs, triageSheet } from "@/content/lore";

/** Ato I: a ficha do caso mais antigo da região. O desfecho é riscado e reescrito com a rolagem. */
export function TriageSheet() {
  return (
    <div className="lore-paper relative mx-auto max-w-md rotate-[-1deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
      <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Ficha de triagem · plantão noturno</p>
      <dl className="mt-4 space-y-3">
        {triageSheet.fields.map((field) => (
          <div key={field.label} className="border-b border-asphalt-deep/20 pb-2">
            <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">{field.label}</dt>
            <dd className="font-hand text-2xl leading-tight">
              {field.correction ? (
                <>
                  <span className="lore-strike relative">{field.value}</span>{" "}
                  <span className="lore-correction text-lazarus">{field.correction}</span>
                </>
              ) : (
                field.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      {/* No celular o carimbo fica dentro da ficha; no desktop ele escapa pelo canto. */}
      <div className="lore-stamp mt-6 inline-block rotate-[-8deg] rounded-sm border-4 border-lazarus/80 bg-plate/60 px-3 py-1 text-center text-lazarus sm:absolute sm:-right-3 sm:-bottom-6 sm:mt-0">
        <p className="font-stencil text-lg tracking-wider uppercase sm:text-xl sm:tracking-widest">
          {triageSheet.stamp}
        </p>
        <p className="max-w-48 text-[11px] leading-tight">{triageSheet.stampNote}</p>
      </div>
    </div>
  );
}

// Janelas de três prédios; cada uma apaga num ponto diferente da rolagem.
const WINDOWS = Array.from({ length: 36 }, (_, i) => ({ i, at: (i * 37) % 60 }));

/** Ato II: as luzes da cidade apagam enquanto o leitor desce pela página. */
export function CityLights() {
  return (
    <div aria-hidden className="lore-city flex h-32 items-end justify-center gap-3">
      {[12, 12, 12].map((count, b) => (
        <div key={b} className={`grid grid-cols-3 gap-1.5 bg-[#0d0f14] p-2 ${b === 1 ? "h-32" : "h-24"}`}>
          {WINDOWS.slice(b * count, b * count + count).map(({ i, at }) => (
            <span key={i} className="lore-window h-3 w-3" style={{ "--at": `${at}%` } as CSSProperties} />
          ))}
        </div>
      ))}
    </div>
  );
}

const TAG_STYLES = ["text-lazarus", "text-sunset", "text-radio", "text-plate"];

/** Ato V: os nomes pintados nas paredes. */
export function GangTags() {
  return (
    <ul
      aria-label="Gangues que marcaram território"
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded bg-[repeating-linear-gradient(90deg,#24211d_0_46px,#1c1a17_46px_48px)] px-4 py-8"
    >
      {gangs.map((gang, i) => (
        <li
          key={gang}
          className={`reveal font-hand text-3xl sm:text-4xl ${TAG_STYLES[i % TAG_STYLES.length]}`}
          style={{ rotate: `${((i * 7) % 11) - 5}deg` }}
        >
          {gang}
        </li>
      ))}
    </ul>
  );
}
