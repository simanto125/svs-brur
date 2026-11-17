import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function AdminModalShell({ title, onClose, children, wide = false }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm sm:py-10">
      <div className={`w-full rounded-3xl bg-white shadow-soft ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between gap-4 border-b border-navy-100 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-navy-500 transition hover:bg-navy-50">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
