// Lê o volume do microfone a cada frame. O áudio só é analisado aqui no navegador:
// nada é gravado nem enviado.
import { rms } from "@/lib/games/voice";

export type Microphone = { stop: () => void };

export async function startMicrophone(onLoudness: (rms: number) => void): Promise<Microphone> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);

  let frame = requestAnimationFrame(function read() {
    analyser.getFloatTimeDomainData(samples);
    onLoudness(rms(samples));
    frame = requestAnimationFrame(read);
  });

  return {
    stop: () => {
      cancelAnimationFrame(frame);
      stream.getTracks().forEach((track) => track.stop());
      void ctx.close();
    },
  };
}
