import { publicCall } from '@/lib/supabase';

export function trackDownload(kind: 'book' | 'notice', id: string) {
  publicCall('record_download', { kind, id }).catch(() => {});
}
