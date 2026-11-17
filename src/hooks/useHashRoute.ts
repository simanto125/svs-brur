import { useEffect, useState, useCallback } from 'react';

export type Route = string;

function currentRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/')) return hash.slice(1);
  return '';
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(currentRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const clean = to.replace(/^\//, '');
    window.location.hash = `/${clean}`;
    if (!clean) window.scrollTo({ top: 0 });
  }, []);

  const isRoute = useCallback(
    (check: string) => {
      const r = currentRoute();
      return r === check;
    },
    [],
  );

  return { route, navigate, isRoute };
}

export function scrollToSection(id: string) {
  if (window.location.hash && window.location.hash !== `#${id}`) {
    window.location.hash = id;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
