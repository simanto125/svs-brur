import { Search, X } from 'lucide-react';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AnimatedSearch({ id, value, onChange, placeholder }: Props) {
  return (
    <div className="group relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-[linear-gradient(90deg,#efbd5a,#22b8cf,#f43f5e,#efbd5a)] bg-[length:300%_100%] opacity-0 blur-md transition-opacity duration-500 group-focus-within:animate-gradient-shift group-focus-within:opacity-70"
      />
      <div className="relative flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-navy-200 transition-all duration-300 group-focus-within:ring-2 group-focus-within:ring-saffron-400">
        <Search
          size={18}
          className="flex-none text-navy-400 transition duration-300 group-focus-within:scale-110 group-focus-within:text-saffron-600"
        />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="rounded-full p-1 text-navy-400 transition hover:bg-navy-50 hover:text-navy-700"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
