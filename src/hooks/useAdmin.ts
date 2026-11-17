import { useCallback, useEffect, useState } from 'react';
import { adminCall } from '@/lib/supabase';

export function useAdmin(passkey: string) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const verify = useCallback(async (key: string): Promise<boolean> => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await adminCall<{ ok?: boolean; error?: string }>(key, 'verify');
      if (res.error) throw new Error(res.error);
      setVerified(true);
      return true;
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Invalid passkey');
      return false;
    } finally {
      setVerifying(false);
    }
  }, []);

  const logout = useCallback(() => setVerified(false), []);

  return { verified, verifying, verifyError, verify, logout };
}

export function useAdminList<T>(passkey: string, action: string, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCall<{ data: T[]; error?: string }>(passkey, action);
      setItems(res.data ?? []);
      setError(res.error ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load items');
    } finally {
      setLoading(false);
    }
  }, [passkey, action]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (passkey) reload();
  }, [reload, passkey, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { items, loading, error, reload };
}
