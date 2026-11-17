import { useState } from 'react';
import { Check, RotateCcw, Save, Sparkles } from 'lucide-react';
import { DEFAULT_EMBLEM_CONTENT, getEmblemContent, saveEmblemContent, type EmblemContent } from '@/lib/emblemContent';

export default function EmblemContentEditor() {
  const [content, setContent] = useState<EmblemContent>(getEmblemContent);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof EmblemContent, value: string) => {
    setContent((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    saveEmblemContent(content);
    setSaved(true);
  };

  const reset = () => {
    setContent(DEFAULT_EMBLEM_CONTENT);
    saveEmblemContent(DEFAULT_EMBLEM_CONTENT);
    setSaved(true);
  };

  return (
    <form onSubmit={save} className="card max-w-4xl space-y-6 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow inline-flex items-center gap-1.5"><Sparkles size={13} /> Emblem CMS</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-navy-900">Meaning &amp; History Content</h2>
          <p className="mt-1 text-sm leading-relaxed text-navy-500">Edit the text shown when visitors open the SVS emblem. Changes are saved in this browser and appear instantly on the public modal.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Badge label" value={content.badge} onChange={(value) => update('badge', value)} />
        <Field label="Branch / founding line" value={content.meta} onChange={(value) => update('meta', value)} />
        <div className="sm:col-span-2"><Field label="Section heading" value={content.heading} onChange={(value) => update('heading', value)} /></div>
        <TextArea label="Meaning paragraph" value={content.paragraphOne} onChange={(value) => update('paragraphOne', value)} />
        <TextArea label="History paragraph" value={content.paragraphTwo} onChange={(value) => update('paragraphTwo', value)} />
        <div className="sm:col-span-2"><TextArea label="Symbolism paragraph" value={content.paragraphThree} onChange={(value) => update('paragraphThree', value)} /></div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-navy-100 pt-5">
        <button type="submit" className="btn-primary"><Save size={16} /> Save Content</button>
        <button type="button" onClick={reset} className="btn-ghost"><RotateCcw size={16} /> Restore defaults</button>
        {saved && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><Check size={16} /> Saved locally</span>}
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="label-text">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="input-field" /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="label-text">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="input-field resize-y" /></label>;
}
