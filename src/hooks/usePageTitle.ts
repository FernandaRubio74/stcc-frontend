import { useEffect } from 'react';

/**
 * Antes TODAS las pantallas mostraban "GENIAL" en la pestaña del
 * navegador, sin indicar en que seccion estaba el usuario (ni tener algo
 * distinto para anunciar a un lector de pantalla al navegar entre rutas).
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · GENIAL`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
