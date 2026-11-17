import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, playChime, startAmbient, toggleSound } from '@/lib/sound';

interface EntryGateProps {
  onComplete: () => void;
}

const MANTRAS = ['ॐ भूर्भुवः स्वः', 'विद्या ददाति विनयम्', 'सत्यं शिवं सुन्दरम्'];

export default function EntryGate({ onComplete }: EntryGateProps) {
  const [value, setValue] = useState('');
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(() => !isSoundEnabled());
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const enter = () => {
    if (!/^(om|ॐ)$/i.test(value.trim())) return;
    setStarted(true);
    if (!muted) startAmbient();
    playChime();
    timerRef.current = window.setTimeout(onComplete, 4500);
  };

  if (started) return <WelcomeSequence muted={muted} onSkip={onComplete} />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040814] px-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(61,213,245,0.14),transparent_28%),radial-gradient(circle_at_50%_50%,rgba(229,132,25,0.12),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 entry-stars" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-8 rounded-full border border-saffron-300/40 bg-white/5 p-3 shadow-[0_0_70px_rgba(239,189,90,0.35)]">
          <div className="absolute inset-0 rounded-full bg-cyan-300/20 blur-2xl" />
          <img src="/svs-logo.svg" alt="SVS emblem" className="relative h-36 w-36 rounded-full object-cover" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-saffron-300">A sacred beginning</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-wide text-white sm:text-6xl">ॐ</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">Enter the light of knowledge and devotion.</p>
        <form onSubmit={(event) => { event.preventDefault(); enter(); }} className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder={'Type “Om” to Enter'} aria-label="Type Om to enter" className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-center text-sm text-white outline-none backdrop-blur-md transition placeholder:text-slate-400 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20 sm:text-left" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-bold text-navy-950 shadow-glow transition hover:scale-[1.03]">Enter <ArrowRight size={17} /></button>
        </form>
        <p className="mt-4 text-xs text-slate-500">Press Enter or click Enter</p>
        <div className="mt-16 flex items-center gap-4 text-[11px] text-slate-500"><a href="#/admin" className="transition hover:text-saffron-300">Admin Login</a><span className="h-1 w-1 rounded-full bg-slate-600" /><a href="#/join-committee" className="transition hover:text-saffron-300">Committee Login</a></div>
        <button type="button" onClick={() => { const next = !muted; setMuted(next); toggleSound(!next); }} className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-300 backdrop-blur-md transition hover:border-cyan-300/40 hover:text-white">{muted ? <VolumeX size={14} /> : <Volume2 size={14} />}{muted ? 'Muted' : 'Sound on'}</button>
      </div>
    </main>
  );
}

function WelcomeSequence({ muted, onSkip }: { muted: boolean; onSkip: () => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040814] text-white">
      <WelcomeCanvas />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,8,20,0.15)_50%,rgba(4,8,20,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="sacred-book sacred-book-gita"><span>श्रीमद्भगवद्गीता</span><small>ज्ञान · कर्म · भक्ति</small></div>
        <div className="sacred-book sacred-book-veda"><span>ऋग्वेद</span><small>श्रुति · प्रकाश</small></div>
        <div className="sacred-book sacred-book-upanishad"><span>उपनिषद्</span><small>आत्मा · ब्रह्म</small></div>
      </div>
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.45em] text-cyan-100/40">SVS · Knowledge · Devotion · Service</div>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="welcome-copy animate-welcome-copy">
          <img src="/svs-logo.svg" alt="SVS emblem" className="mx-auto h-36 w-36 rounded-full object-cover shadow-[0_0_70px_rgba(239,189,90,0.7)]" />
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.38em] text-saffron-200">Welcome to</p>
          <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold text-white sm:text-5xl">Sanatani Vidyarthi Sangsad, BRUR</h1>
          <p className="mt-4 text-sm text-cyan-100/70">A spiritual home for wisdom, culture, and service.</p>
        </div>
      </div>
      <button type="button" onClick={onSkip} className="absolute right-5 top-5 z-20 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-saffron-300/60 hover:text-white">Skip</button>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[11px] text-slate-500">{muted ? <VolumeX size={13} /> : <Volume2 size={13} />} Sacred welcome</div>
    </main>
  );
}

function WelcomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const particles = Array.from({ length: 180 }, (_, index) => ({ angle: index * 2.399, radius: 0.2 + Math.random() * 0.8, speed: 0.3 + Math.random() * 1.2, size: 0.5 + Math.random() * 2.2 }));
    const startedAt = performance.now();
    let frame = 0;
    const resize = () => { const ratio = window.devicePixelRatio || 1; canvas.width = window.innerWidth * ratio; canvas.height = window.innerHeight * ratio; canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`; context.setTransform(ratio, 0, 0, ratio, 0, 0); };
    const draw = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      context.clearRect(0, 0, width, height);
      const flare = Math.min(1, elapsed / 0.85);
      const fade = elapsed > 3.8 ? Math.max(0, 1 - (elapsed - 3.8) / 0.7) : 1;
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 260 + flare * 260);
      glow.addColorStop(0, `rgba(255,245,190,${0.42 * fade})`);
      glow.addColorStop(0.16, `rgba(70,224,255,${0.26 * fade})`);
      glow.addColorStop(0.52, `rgba(229,132,25,${0.1 * fade})`);
      glow.addColorStop(1, 'rgba(4,8,20,0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      particles.forEach((particle) => {
        const burst = Math.min(1, Math.max(0, (elapsed - 0.7) / 2.8));
        const distance = (particle.radius * Math.min(width, height) * 0.55) * (0.3 + burst * 1.35) + Math.sin(now / 700 + particle.angle) * 8;
        const x = centerX + Math.cos(particle.angle + now / 10000 * particle.speed) * distance;
        const y = centerY + Math.sin(particle.angle + now / 10000 * particle.speed) * distance * 0.62;
        context.fillStyle = particle.angle % 2 > 1 ? `rgba(113,232,255,${0.25 * fade})` : `rgba(245,216,150,${0.6 * fade})`;
        context.beginPath(); context.arc(x, y, particle.size * (1 + burst), 0, Math.PI * 2); context.fill();
      });
      if (elapsed > 0.9 && elapsed < 3.7) drawMantras(context, centerX, centerY, elapsed, fade);
      if (elapsed > 1.4 && elapsed < 3.85) drawBookAndCube(context, centerX, centerY, elapsed, fade);
      frame = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize); resize(); frame = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frame); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}

function drawMantras(context: CanvasRenderingContext2D, centerX: number, centerY: number, elapsed: number, opacity: number) {
  context.textAlign = 'center'; context.font = '600 17px "Cormorant Garamond", serif';
  MANTRAS.forEach((mantra, index) => { const angle = elapsed * (index % 2 ? -0.35 : 0.28) + index * 2.1; const radius = 130 + index * 55; const x = centerX + Math.cos(angle) * radius; const y = centerY + Math.sin(angle) * radius * 0.55; context.fillStyle = `rgba(245,216,150,${0.7 * opacity})`; context.fillText(mantra, x, y); });
}

function drawBookAndCube(context: CanvasRenderingContext2D, centerX: number, centerY: number, elapsed: number, opacity: number) {
  const size = 105 + Math.sin(elapsed * 4) * 4;
  const rotation = elapsed * 0.8;
  context.save(); context.translate(centerX, centerY + 20); context.rotate(rotation * 0.15);
  context.strokeStyle = `rgba(110,226,255,${0.65 * opacity})`; context.lineWidth = 1.5;
  const points = [[-size, -size], [size, -size], [size, size], [-size, size]];
  context.beginPath(); points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y)); context.closePath(); context.stroke();
  context.beginPath(); context.moveTo(-size, -size); context.lineTo(size * 0.7, size * 0.7); context.moveTo(size, -size); context.lineTo(-size * 0.7, size * 0.7); context.stroke();
  context.fillStyle = `rgba(245,182,72,${0.25 * opacity})`; context.shadowColor = '#f5b648'; context.shadowBlur = 30; context.beginPath(); context.moveTo(0, 12); context.lineTo(-62, -10); context.lineTo(-8, -24); context.lineTo(62, -10); context.closePath(); context.fill(); context.shadowBlur = 0;
  context.strokeStyle = `rgba(255,220,125,${0.9 * opacity})`; context.beginPath(); context.moveTo(0, 12); context.lineTo(0, -22); context.moveTo(0, 12); context.lineTo(-62, -10); context.moveTo(0, 12); context.lineTo(62, -10); context.stroke(); context.restore();
}
