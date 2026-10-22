// Som ambiente sintetizado (sem arquivos): vento de ruído filtrado e batimento
// cardíaco que acelera com o medo. Só é criado depois de um clique do visitante.

export type Ambience = { setFear: (fear: number) => void; stop: () => void };

function wind(ctx: AudioContext, out: AudioNode) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;

  const gain = ctx.createGain();
  gain.gain.value = 0.06;
  // Rajadas lentas.
  const gust = ctx.createOscillator();
  const gustDepth = ctx.createGain();
  gust.frequency.value = 0.12;
  gustDepth.gain.value = 0.035;
  gust.connect(gustDepth).connect(gain.gain);

  noise.connect(filter).connect(gain).connect(out);
  noise.start();
  gust.start();
}

function thump(ctx: AudioContext, out: AudioNode, at: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(70, at);
  osc.frequency.exponentialRampToValueAtTime(40, at + 0.12);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + 0.2);
}

export function startAmbience(): Ambience {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);
  wind(ctx, master);

  let fear = 0;
  let timer: ReturnType<typeof setTimeout>;
  const beat = () => {
    // Coração só aparece a partir de Tense (30); 60 → 140 bpm.
    if (fear >= 30) {
      const now = ctx.currentTime;
      const volume = 0.15 + (fear / 100) * 0.35;
      thump(ctx, master, now, volume);
      thump(ctx, master, now + 0.22, volume * 0.7);
    }
    timer = setTimeout(beat, 60_000 / (60 + fear * 0.8));
  };
  beat();

  return {
    setFear: (value) => {
      fear = value;
    },
    stop: () => {
      clearTimeout(timer);
      void ctx.close();
    },
  };
}
