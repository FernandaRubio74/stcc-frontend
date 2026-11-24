import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ensureMermaidInitialized } from '../../../lib/mermaidTheme';

interface ErDiagramProps {
  diagram: string | null;
}

// STCC-114 (T-022.1): renderizado read-only del diagrama ER a partir del
// string Mermaid que ya genera el backend (T-019.2) — este componente no
// recalcula nada, solo lo pinta.
export function ErDiagram({ diagram }: ErDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagram) return;
    ensureMermaidInitialized();
    let cancelled = false;
    const id = `er-diagram-${Math.random().toString(36).slice(2)}`;

    mermaid
      .render(id, diagram)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo renderizar el diagrama');
      });

    return () => {
      cancelled = true;
    };
  }, [diagram]);

  if (!diagram) {
    return <p className="text-body-sm text-on-surface-variant">Todavía no hay un diagrama generado.</p>;
  }

  return (
    <div>
      {error && (
        <p role="alert" className="text-body-sm text-danger">
          {error}
        </p>
      )}
      <div
        ref={containerRef}
        data-testid="er-diagram"
        className="overflow-x-auto rounded-card border border-outline-variant/30 bg-surface-container-low p-4"
      />
    </div>
  );
}
