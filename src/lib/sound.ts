const SOUND_KEY = 'svs-sound-enabled';

let audioContext: AudioContext | null = null;
let ambientNodes: { oscillator: OscillatorNode; gain: GainNode }[] = [];

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'off';
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
}

function getAudio(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playNote(frequency: number, startAt: number, duration: number, type: OscillatorType, volume: number) {
  const ctx = getAudio();
  if (!ctx) return;
  const t = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playTick() {
  if (!isSoundEnabled()) return;
  playNote(880, 0, 0.08, 'square', 0.03);
}

export function playChime() {
  if (!isSoundEnabled()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playNote(f, i * 0.12, 0.7, 'triangle', 0.12));
}

export function startAmbient() {
  if (!isSoundEnabled() || ambientNodes.length > 0) return;
  const ctx = getAudio();
  if (!ctx) return;
  [108, 216].forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = index === 0 ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.045 : 0.018, ctx.currentTime + 1.5);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    ambientNodes.push({ oscillator, gain });
  });
}

export function stopAmbient() {
  const ctx = audioContext;
  if (!ctx) return;
  ambientNodes.forEach(({ oscillator, gain }) => {
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
    oscillator.stop(ctx.currentTime + 0.8);
  });
  ambientNodes = [];
}

export function toggleSound(enabled: boolean) {
  setSoundEnabled(enabled);
  if (enabled) startAmbient();
  else stopAmbient();
}
