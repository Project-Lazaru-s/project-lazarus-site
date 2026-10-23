import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { decodeCard, SIDES } from "@/lib/enlist/enlist";

export const alt = "Ficha de alistamento do servidor de guerra do Project Lazarus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stencil = await readFile(
  join(/* turbopackIgnore: true */ process.cwd(), "assets", "og", "SairaStencilOne-Regular.ttf"),
);
const colors = {
  asphalt: "#121212",
  plate: "#e8e2d0",
  paper: "#e8e0cc",
  red: "#b3201c",
  rust: "#8a4b2a",
  sunset: "#d9822b",
};

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const card = decodeCard((await params).code);
  const side = SIDES.find((s) => s.id === card?.side);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 80px",
        background: `linear-gradient(180deg, #1c1a17 0%, ${colors.asphalt} 55%, #3a1d10 100%)`,
        fontFamily: "Saira Stencil",
        color: colors.plate,
      }}
    >
      <div style={{ display: "flex", fontSize: 30, letterSpacing: 8, color: colors.sunset }}>
        PROJECT LAZARUS · SERVIDOR DE GUERRA
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginTop: 28,
          padding: "36px 48px",
          background: colors.paper,
          color: colors.asphalt,
          borderRadius: 6,
          boxShadow: `0 0 0 6px ${colors.rust}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8 }}>FICHA Nº {card?.number ?? "?"}</div>
        <div style={{ display: "flex", fontSize: 104, lineHeight: 1.1 }}>{card?.nick ?? "Desconhecido"}</div>
        <div style={{ display: "flex", fontSize: 40, color: colors.rust }}>LADO: {side?.name ?? "?"}</div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 40,
            right: 48,
            padding: "6px 18px",
            border: `6px solid ${colors.red}`,
            color: colors.red,
            fontSize: 48,
            transform: "rotate(-8deg)",
          }}
        >
          ALISTADO
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 34, marginTop: 28 }}>
        Escolha o seu lado antes que a fronteira feche.
      </div>
    </div>,
    { ...size, fonts: [{ name: "Saira Stencil", data: stencil, style: "normal", weight: 400 }] },
  );
}
