import { CalendarHeart, Sparkles } from 'lucide-react';
import { heroImage } from '@/data/constants';
import { useSiteInfo } from '@/hooks/useSiteInfo';

export default function Hero() {
  const site = useSiteInfo();
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      {/* background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Saraswati Puja celebration"
          className="h-full w-full object-cover object-top bg-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/80 to-navy-800/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(229,132,25,0.18),transparent_60%)]" />
      </div>

      {/* aurora glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-saffron-400/30 blur-3xl animate-blob" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-blob-slow" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-rose-400/20 blur-3xl animate-blob" />
      </div>

      {/* decorative floating diya */}
      <div className="animate-float absolute right-10 top-32 hidden h-24 w-24 rounded-full bg-gold-gradient opacity-20 blur-2xl lg:block" />

      <div className="container-x relative z-10 pt-28 pb-16">
        <div className="max-w-3xl">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-saffron-400/40 bg-saffron-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-200">
            <Sparkles size={14} /> {site.site_name}
          </span>
          <h1
            className="animate-fade-up mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            A spiritual home for the
            <span className="block bg-gradient-to-r from-saffron-300 via-saffron-400 to-saffron-200 bg-clip-text text-transparent">
              students of BRUR.
            </span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-navy-100"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Welcome to the Begum Rokeya University, Rangpur branch of Saraswata
            Vandana Samity — a community devoted to devotion, culture, and
            service. Together we celebrate our heritage, uplift our peers, and
            walk a path of wisdom and compassion.
          </p>
          <div
            className="animate-fade-up mt-9 flex flex-wrap gap-4"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <a href="#join" className="btn-primary">
              Join SVS
            </a>
            <a
              href="#events"
              className="btn-ghost border-white/30 bg-white/10 text-white hover:border-saffron-300 hover:text-saffron-200"
            >
              <CalendarHeart size={18} /> Upcoming Events
            </a>
          </div>

          {/* stats */}
          <div
            className="animate-fade-up mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-8"
            style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            {[
              { value: '500+', label: 'Active Members' },
              { value: '18', label: 'Years of Legacy' },
              { value: '40+', label: 'Events Organized' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-saffron-300">
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-navy-200">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream-50 to-transparent" />
    </section>
  );
}
