import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { getEmblemContent, subscribeToEmblemContent, type EmblemContent } from '@/lib/emblemContent';
import { useSiteInfo } from '@/hooks/useSiteInfo';

interface LogoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LogoModal({ open, onClose }: LogoModalProps) {
  const site = useSiteInfo();
  const [content, setContent] = useState<EmblemContent>(getEmblemContent);

  useEffect(() => subscribeToEmblemContent(() => setContent(getEmblemContent())), []);

  return (
    <Modal open={open} onClose={onClose} label="Emblem & History" size="lg">
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-navy-gradient p-8 text-center">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-saffron-400/20 blur-3xl" />
          <img
            src={site.logo_url ?? 'https://i.ibb.co/ds2dPcQc/svs.jpg'}
            alt={`${site.site_name} logo`}
            className="relative h-36 w-36 rounded-full object-cover shadow-glow ring-4 ring-saffron-400/40"
          />
          <h3 className="relative mt-5 font-display text-2xl font-bold text-white">{site.site_name}</h3>
          <span className="relative mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-300">{content.meta}</span>
        </div>
        <div className="p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold text-saffron-700">
            <Sparkles size={13} /> {content.badge}
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-navy-900">{content.heading}</h3>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">{content.paragraphOne}</p>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">{content.paragraphTwo}</p>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">{content.paragraphThree}</p>
        </div>
      </div>
    </Modal>
  );
}
