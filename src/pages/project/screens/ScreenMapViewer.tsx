import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { Screen } from '../../../types/screens';

mermaid.initialize({ startOnLoad: false });

interface Props {
  diagram: string | null;
  screens: Screen[];
}

// US-027/US-030: el grafo de navegacion se renderiza con mermaid (igual que
// ErDiagram), pero ademas se postprocesa el SVG para que cada nodo
// ("pantalla") sea clickeable y muestre su mockup de baja fidelidad
// (T-030.1/T-030.2). El nombre visible del nodo coincide exactamente con
// screen.name porque asi lo genera flowchart.js en el backend.
export function ScreenMapViewer({ diagram, screens }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  useEffect(() => {
    setSelectedScreen(null);
    if (!diagram || !containerRef.current) return;

    let active = true;
    const id = `screen-map-${Math.random().toString(36).slice(2)}`;

    mermaid.render(id, diagram).then(({ svg }) => {
      if (!active || !containerRef.current) return;
      containerRef.current.innerHTML = svg;

      containerRef.current.querySelectorAll<SVGGElement>('.node').forEach((nodeEl) => {
        const label = nodeEl.textContent?.trim();
        const screen = screens.find((s) => s.name === label);
        if (!screen) return;
        nodeEl.style.cursor = 'pointer';
        nodeEl.addEventListener('click', () => setSelectedScreen(screen));
      });
    });

    return () => {
      active = false;
    };
  }, [diagram, screens]);

  if (!diagram) {
    return <p className="text-sm text-gray-500">Todavía no hay un mapa de pantallas generado.</p>;
  }

  return (
    <div className="space-y-3">
      <div ref={containerRef} data-testid="screen-map-diagram" className="overflow-x-auto" />

      {selectedScreen && (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4" data-testid="screen-mockup">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-indigo-900">{selectedScreen.name}</h3>
            <button
              type="button"
              onClick={() => setSelectedScreen(null)}
              className="text-xs text-indigo-600 hover:underline"
            >
              Cerrar
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-700">{selectedScreen.purpose}</p>
          <div className="mt-3 space-y-1 rounded border border-dashed border-gray-300 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mockup de baja fidelidad</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {selectedScreen.mainElements.map((element, i) => (
                <li key={i}>{element}</li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-xs text-gray-500">Visible para: {selectedScreen.visibleToRoles.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
