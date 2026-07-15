// Small WebAudio synth for game feel — no audio files shipped. All sounds
// are generated on the fly from oscillators/noise, so the whole audio layer
// is a few KB of code instead of asset payload.

let ctx = null;
let muted = false;

export function setMuted(v) {
  muted = v;
}

function getCtx() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function envGain(c, t0, peak, attack, release) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
  return g;
}

function playTone({ freq, duration, type = "sine", gain = 0.2, filterFreq, delay = 0 }) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  const g = envGain(c, t0, gain, 0.006, duration);
  let node = osc;
  if (filterFreq) {
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    osc.connect(filter);
    node = filter;
  }
  node.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function playNoise({ duration, gain = 0.15, filterFreq = 1200, delay = 0 }) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  const g = envGain(c, t0, gain, 0.001, duration);
  noise.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  noise.start(t0);
}

export const sounds = {
  moveTick() {
    if (muted) return;
    playTone({ freq: 190, duration: 0.08, type: "triangle", gain: 0.16, filterFreq: 900 });
  },
  wallClack() {
    if (muted) return;
    playNoise({ duration: 0.07, gain: 0.32, filterFreq: 2400 });
    playTone({ freq: 120, duration: 0.12, type: "square", gain: 0.12 });
  },
  errorThunk() {
    if (muted) return;
    playTone({ freq: 85, duration: 0.16, type: "sawtooth", gain: 0.14, filterFreq: 260 });
  },
  aiWall() {
    if (muted) return;
    playNoise({ duration: 0.09, gain: 0.28, filterFreq: 1700 });
    playTone({ freq: 95, duration: 0.14, type: "square", gain: 0.1 });
  },
  winFlourish() {
    if (muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => playTone({ freq, duration: 0.32, type: "sine", gain: 0.14, delay: i * 0.09 }));
  },
};
