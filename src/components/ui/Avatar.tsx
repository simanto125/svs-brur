interface AvatarProps {
  src: string | null | undefined;
  name: string;
  className?: string;
}

export default function Avatar({ src, name, className = 'h-16 w-16' }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} loading="lazy" className={`${className} rounded-full object-cover`} />;
  }
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-navy-100 font-display text-lg font-semibold text-navy-700`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
