// "Seu PC aguenta?": estimativa a partir do que o navegador revela. Nada sai do navegador.
// Requisitos do 1.0.0: 8 GB de RAM recomendados, 6 GB no mínimo; o shader é o que mais pesa no FPS.

export type PcSpecs = {
  /** navigator.hardwareConcurrency */
  cores: number | null;
  /** navigator.deviceMemory: arredondado para baixo em potências de 2, teto de 8 (só Chrome/Edge). */
  memoryGb: number | null;
  /** Nome da placa de vídeo via WebGL. */
  gpu: string | null;
  mobile: boolean;
};

export type CheckStatus = "ok" | "warn" | "bad" | "unknown";
export type PcCheck = { label: string; value: string; status: CheckStatus; note: string };
export type Verdict = "aguenta" | "sem-shader" | "no-limite" | "vai-sofrer" | "incerto" | "celular";

const INTEGRATED = /intel(?!.*\barc\b)|\buhd\b|\biris\b|radeon\(tm\) graphics|radeon graphics|vega \d* ?graphics/i;
// Renderizadores por software: o navegador está sem aceleração de vídeo e esconde a placa de verdade.
const SOFTWARE = /swiftshader|llvmpipe|microsoft basic/i;
const DEDICATED = /nvidia|geforce|quadro|\brtx\b|\bgtx\b|radeon rx|radeon pro|\barc\b|apple m\d/i;

function memoryCheck(memoryGb: number | null): PcCheck {
  const label = "Memória";
  if (memoryGb === null)
    return { label, value: "não informada", status: "unknown", note: "Só o Chrome e o Edge informam a RAM." };
  if (memoryGb >= 8) return { label, value: "8 GB ou mais", status: "ok", note: "Reserve 8 GB para o jogo." };
  if (memoryGb >= 4)
    return {
      label,
      value: "entre 4 e 8 GB",
      status: "warn",
      note: "O navegador arredonda para baixo. O mínimo é 6 GB; com menos de 8, feche outros programas.",
    };
  return { label, value: "menos de 4 GB", status: "bad", note: "Abaixo do mínimo de 6 GB." };
}

function cpuCheck(cores: number | null): PcCheck {
  const label = "Processador";
  if (cores === null) return { label, value: "não informado", status: "unknown", note: "O navegador não disse." };
  return cores >= 4
    ? { label, value: `${cores} núcleos`, status: "ok", note: "Suficiente para a simulação padrão (8)." }
    : { label, value: `${cores} núcleos`, status: "warn", note: "Poucos núcleos: reduza a distância de simulação." };
}

function gpuCheck(gpu: string | null): PcCheck {
  const label = "Placa de vídeo";
  if (!gpu) return { label, value: "não informada", status: "unknown", note: "O navegador escondeu o modelo." };
  const name = gpu.replace(/^ANGLE \(|\s*Direct3D.*$|\)$/g, "").trim();
  if (SOFTWARE.test(gpu))
    return {
      label,
      value: "não identificada",
      status: "unknown",
      note: "O navegador está sem aceleração de vídeo, então não mostra a placa. Isso não afeta o jogo.",
    };
  if (DEDICATED.test(gpu)) return { label, value: name, status: "ok", note: "Dedicada: dá para tentar com shader." };
  if (INTEGRATED.test(gpu))
    return { label, value: name, status: "warn", note: "Integrada: jogue sem shader, é o que mais pesa no FPS." };
  return { label, value: name, status: "unknown", note: "Não reconhecemos esse modelo." };
}

export function assessPc(specs: PcSpecs): { verdict: Verdict; checks: PcCheck[] } {
  const memory = memoryCheck(specs.memoryGb);
  const checks = [memory, cpuCheck(specs.cores), gpuCheck(specs.gpu)];
  if (specs.mobile) return { verdict: "celular", checks };

  const statuses = checks.map((c) => c.status);
  const verdict: Verdict = statuses.includes("bad")
    ? "vai-sofrer"
    : memory.status === "warn"
      ? "no-limite"
      : memory.status === "unknown"
        ? "incerto"
        : checks[2].status === "warn"
          ? "sem-shader"
          : "aguenta";
  return { verdict, checks };
}

/** Lê o que o navegador revela. Só roda no navegador, depois de um clique. */
export function readSpecs(): PcSpecs {
  const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { mobile?: boolean } };
  let gpu: string | null = null;
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    gpu = gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : null;
  } catch {
    gpu = null;
  }
  return {
    cores: nav.hardwareConcurrency || null,
    memoryGb: nav.deviceMemory ?? null,
    gpu,
    mobile: nav.userAgentData?.mobile ?? /Mobi|Android|iPhone|iPad/i.test(nav.userAgent),
  };
}
