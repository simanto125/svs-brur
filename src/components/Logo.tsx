import { useSiteInfo } from '@/hooks/useSiteInfo';

const DEFAULT_LOGO_URL = 'https://i.ibb.co/ds2dPcQc/svs.jpg';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-10 w-10' }: LogoProps) {
  const site = useSiteInfo();
  return (
    <img
      src={site.logo_url ?? DEFAULT_LOGO_URL}
      alt={`${site.site_name} logo`}
      className={`${className} rounded-full object-cover drop-shadow-sm`}
    />
  );
}
