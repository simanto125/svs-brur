import { Facebook, Mail, MapPin, Phone, Send } from 'lucide-react';
import Logo from './Logo';
import { navLinks } from '@/data/constants';
import { useSiteInfo } from '@/hooks/useSiteInfo';

export default function Footer() {
  const site = useSiteInfo();
  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* about */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Logo className="h-12 w-12" />
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  {site.site_name}
                </h3>
                <p className="text-xs tracking-wider text-saffron-300">
                  BEGUM ROKEYA UNIVERSITY, RANGPUR — BRUR BRANCH
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-navy-200">
              {site.site_description}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook Page"
                className="rounded-full bg-white/5 p-3 text-saffron-300 ring-1 ring-white/10 transition hover:bg-saffron-500 hover:text-navy-950"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://facebook.com/groups"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook Group"
                className="rounded-full bg-white/5 p-3 text-saffron-300 ring-1 ring-white/10 transition hover:bg-saffron-500 hover:text-navy-950"
              >
                <Send size={18} />
              </a>
              <a
                href="mailto:svs.brur@gmail.com"
                aria-label="Email"
                className="rounded-full bg-white/5 p-3 text-saffron-300 ring-1 ring-white/10 transition hover:bg-saffron-500 hover:text-navy-950"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* quick links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-navy-200 transition hover:text-saffron-300"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white">
              Reach Us
            </h4>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 flex-none text-saffron-300" />
                <span className="text-navy-200">
                  SVS Office, Student Welfare Centre, BRUR Campus, Rangpur,
                  Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="flex-none text-saffron-300" />
                <a href="tel:+8801711000000" className="text-navy-200 transition hover:text-saffron-300">
                  +880 1711-000000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-none text-saffron-300" />
                <a href="mailto:svs.brur@gmail.com" className="text-navy-200 transition hover:text-saffron-300">
                  svs.brur@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-5 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-saffron-300">
                Helpline
              </p>
              <p className="mt-1 text-sm text-navy-200">
                General Secretary: +880 1714-400500
              </p>
              <p className="text-sm text-navy-200">
                Cultural Secretary: +880 1715-500600
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-navy-300 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.site_name}. All rights reserved.
          </p>
          <p className="text-xs text-navy-400">
            Devoted to wisdom, culture &amp; service.
          </p>
          <a href="#/admin" className="text-xs text-navy-400 transition hover:text-saffron-300">
            Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
