import { useEffect, useState } from 'react';
import { publicCall } from '@/lib/supabase';

export interface SiteInfo {
  site_name: string;
  site_description: string;
  logo_url: string | null;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  site_name: 'সনাতনী বিদ্যার্থী সংসদ, বেরবি শাখা',
  site_description:
    'Since 2007, SVS has been a spiritual, cultural, and social welfare organisation at Begum Rokeya University, Rangpur.',
  logo_url: null,
};

export function useSiteInfo(): SiteInfo {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);

  useEffect(() => {
    let cancelled = false;
    publicCall<{ data?: SiteInfo }>('get_site_info')
      .then((res) => {
        if (!cancelled && res.data) setInfo(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}
