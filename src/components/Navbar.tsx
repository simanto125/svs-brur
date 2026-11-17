import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/data/constants';
import { useSiteInfo } from '@/hooks/useSiteInfo';
import Logo from './Logo';
import LogoModal from './LogoModal';

interface NavbarProps {
  onLogoClick?: () => void;
}

export default function Navbar({ onLogoClick }: NavbarProps) {
  const site = useSiteInfo();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => setOpen(false);
  const handleLogo = () => {
    setLogoOpen(true);
    onLogoClick?.();
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-cream-50/90 shadow-soft backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <nav className="container-x flex items-center justify-between py-3">
          <button onClick={handleLogo} className="flex items-center gap-3" aria-label="SVS emblem & history">
            <Logo className="h-11 w-11" />
            <div className="flex flex-col leading-none text-left">
              <span
                className={`max-w-[12rem] truncate font-display text-base font-bold tracking-wide sm:max-w-none sm:text-lg ${
                  scrolled ? 'text-navy-900' : 'text-white'
                }`}
              >
                {site.site_name}
              </span>
            </div>
          </button>

          {/* desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-navy-700 hover:bg-saffron-50 hover:text-saffron-700'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <a href="#/join-committee" className="text-sm font-medium text-saffron-600 transition hover:text-saffron-700">
              Committee Portal
            </a>
            <a href="#join" className="btn-primary">
              Join Us
            </a>
          </div>

          {/* mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`rounded-lg p-2 lg:hidden ${
              scrolled ? 'text-navy-900' : 'text-white'
            }`}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* mobile menu */}
        {open && (
          <div className="animate-fade-in border-t border-saffron-100 bg-cream-50/98 backdrop-blur-md lg:hidden">
            <ul className="container-x flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={handleClick}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-navy-700 hover:bg-saffron-50 hover:text-saffron-700"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#/join-committee"
                  onClick={handleClick}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-saffron-700 hover:bg-saffron-50"
                >
                  Committee Portal
                </a>
              </li>
              <li>
                <a
                  href="#join"
                  onClick={handleClick}
                  className="btn-primary mt-2 w-full"
                >
                  Join Us
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      <LogoModal open={logoOpen} onClose={() => setLogoOpen(false)} />
    </>
  );
}
