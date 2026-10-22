import { describe, expect, it } from "vitest";
import { assessPc, type PcSpecs } from "./pc-check";

const gamingPc: PcSpecs = { cores: 12, memoryGb: 8, gpu: "ANGLE (NVIDIA GeForce RTX 3060 Direct3D11)", mobile: false };

const check = (specs: PcSpecs, label: string) => assessPc(specs).checks.find((c) => c.label === label)!;

describe("assessPc", () => {
  it("a gaming PC handles it", () => {
    expect(assessPc(gamingPc).verdict).toBe("aguenta");
    expect(assessPc(gamingPc).checks.every((c) => c.status === "ok")).toBe(true);
  });

  it("a phone is not the platform", () => {
    expect(assessPc({ ...gamingPc, mobile: true }).verdict).toBe("celular");
  });

  it("integrated graphics play without shaders", () => {
    for (const gpu of [
      "ANGLE (Intel(R) UHD Graphics 620 Direct3D11)",
      "ANGLE (AMD Radeon(TM) Graphics Direct3D11)",
      "Intel Iris Xe Graphics",
    ]) {
      expect(assessPc({ ...gamingPc, gpu }).verdict).toBe("sem-shader");
      expect(check({ ...gamingPc, gpu }, "Placa de vídeo").status).toBe("warn");
    }
  });

  it("a software renderer hides the real card instead of passing for integrated", () => {
    for (const gpu of ["Google SwiftShader", "llvmpipe (LLVM 15.0.7, 256 bits)", "Microsoft Basic Render Driver"]) {
      const result = check({ ...gamingPc, gpu }, "Placa de vídeo");
      expect(result.status).toBe("unknown");
      expect(result.note).toMatch(/aceleração/i);
    }
    expect(assessPc({ ...gamingPc, gpu: "Google SwiftShader" }).verdict).toBe("aguenta");
  });

  it("dedicated cards are fine", () => {
    for (const gpu of ["AMD Radeon RX 6600", "Intel(R) Arc(TM) A750", "NVIDIA GeForce GTX 1660"]) {
      expect(check({ ...gamingPc, gpu }, "Placa de vídeo").status).toBe("ok");
    }
  });

  it("4 GB reported means somewhere between 4 and 8 (the browser rounds down): on the edge", () => {
    expect(assessPc({ ...gamingPc, memoryGb: 4 }).verdict).toBe("no-limite");
    expect(check({ ...gamingPc, memoryGb: 4 }, "Memória").status).toBe("warn");
  });

  it("less than 4 GB will suffer", () => {
    expect(assessPc({ ...gamingPc, memoryGb: 2 }).verdict).toBe("vai-sofrer");
  });

  it("few cores are a warning, not a verdict of doom", () => {
    expect(check({ ...gamingPc, cores: 2 }, "Processador").status).toBe("warn");
  });

  it("says so when the browser does not tell", () => {
    const firefox = { cores: 8, memoryGb: null, gpu: null, mobile: false };
    expect(assessPc(firefox).verdict).toBe("incerto");
    expect(check(firefox, "Memória").status).toBe("unknown");
    expect(check(firefox, "Placa de vídeo").status).toBe("unknown");
  });

  it("bad memory wins over a good GPU", () => {
    expect(assessPc({ ...gamingPc, memoryGb: 1 }).verdict).toBe("vai-sofrer");
  });
});
