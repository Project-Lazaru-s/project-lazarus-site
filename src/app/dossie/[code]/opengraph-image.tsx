import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { decodeRun } from "@/lib/survival/runCode";
import { rank } from "@/lib/survival/survival";

export const alt = "Dossiê de um sobrevivente do Project Lazarus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (file: string) => readFile(join(/* turbopackIgnore: true */ process.cwd(), "assets", "og", file));
const stencil = await asset("SairaStencilOne-Regular.ttf");
const zombie = `data:image/png;base64,${(await asset("zombie-front-x8.png")).toString("base64")}`;
const survivor = `data:image/png;base64,${(await asset("survivor-side-x8.png")).toString("base64")}`;

const colors = { asphalt: "#121212", plate: "#e8e2d0", red: "#b3201c", rust: "#8a4b2a", sunset: "#d9822b" };

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const run = decodeRun((await params).code);
  const stats: [string, string | number][] = run
    ? [
        ["Dias", run.day],
        ["Abates", run.kills],
        ["Mortes", run.deaths],
        ["Hordas", run.record.hordesHeld],
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: `linear-gradient(180deg, #1c1a17 0%, ${colors.asphalt} 55%, #3a1d10 100%)`,
          fontFamily: "Saira Stencil",
          color: colors.plate,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 8, color: colors.sunset }}>PROJECT LAZARUS</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
              padding: "28px 40px",
              background: colors.plate,
              color: colors.asphalt,
              borderRadius: 6,
              boxShadow: `0 0 0 6px ${colors.rust}`,
            }}
          >
            <div style={{ display: "flex", fontSize: 26, letterSpacing: 10 }}>LAZARUS STATUS</div>
            <div style={{ display: "flex", fontSize: 92, lineHeight: 1, color: colors.red }}>{run ? rank(run) : "Desaparecido"}</div>
            <div style={{ display: "flex", gap: 40, marginTop: 24 }}>
              {stats.map(([label, value]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 22, opacity: 0.6 }}>{label}</div>
                  <div style={{ display: "flex", fontSize: 56, lineHeight: 1 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 28 }}>A cidade caiu. Você dura mais?</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={survivor} width={128} height={256} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={zombie} width={160} height={320} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Saira Stencil", data: stencil, style: "normal", weight: 400 }] },
  );
}
