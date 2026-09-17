/** Tiny WebAudio stings (pickup, eat, win). Unlock on first pointer down. */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ac();
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.06, slide = 0) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + dur);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

export const sfx = {
  spawn: () => beep(520, 0.09, "triangle", 0.05, 180),
  drop: () => beep(180, 0.08, "sine", 0.04, -40),
  ignite: () => beep(240, 0.16, "sawtooth", 0.035, 80),
  splash: () => beep(420, 0.12, "sine", 0.04, -220),
  eat: () => beep(300, 0.1, "square", 0.03, -80),
  boom: () => beep(80, 0.28, "sawtooth", 0.07, -50),
  win: () => {
    beep(523, 0.12, "triangle", 0.05, 0);
    setTimeout(() => beep(659, 0.12, "triangle", 0.05, 0), 90);
    setTimeout(() => beep(784, 0.22, "triangle", 0.06, 40), 180);
  },
  error: () => beep(140, 0.14, "square", 0.04, -30),
  pickup: () => beep(660, 0.07, "triangle", 0.04, 120),
};
