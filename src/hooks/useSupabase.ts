import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseQuery<T>(
  table: string,
  select = '*',
  deps: unknown[] = [],
  orderBy?: { column: string; ascending?: boolean },
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    let query = supabase.from(table).select(select);
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    query.then(({ data: rows, error: err }) => {
      if (!active) return;
      if (err) setError(err.message);
      else {
        setData((rows ?? []) as T[]);
        setError(null);
      }
      setLoading(false);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, table, select, ...deps]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, reload };
}
