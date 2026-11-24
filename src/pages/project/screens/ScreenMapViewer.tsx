import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { NavigationEdge, Screen, ScreenElement } from '../../../types/screens';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/icons';
import { ensureMermaidInitialized } from '../../../lib/mermaidTheme';

ensureMermaidInitialized();

interface Props {
  diagram: string | null;
  screens: Screen[];
  navigation: NavigationEdge[];
}

const ELEMENT_ICONS: Record<ScreenElement['type'], string> = {
  list: 'list',
  form: 'description',
  field: 'input',
  button: 'smart_button',
  text: 'notes',
  image: 'image',
  nav: 'arrow_forward',
};

/** Pastilla chiquita, monoespaciada, con el campo/endpoint real al que esta conectado el elemento. */
function DataRefBadge({ element }: { element: ScreenElement }) {
  const ref = element.dataField ? element.dataField : element.endpointRef ? element.endpointRef : null;
  if (!ref) return null;
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] leading-none text-outline">
      {element.dataField ? <Icon name="link" className="text-[10px]" /> : <Icon name="bolt" className="text-[10px]" />}
      {ref}
    </span>
  );
}

/**
 * Wireframe de baja fidelidad puramente client-side (sin IA, sin costo de
 * tiempo): dibuja un placeholder por elemento estructurado que ya trae la
 * pantalla, mostrando a que campo o endpoint real se conecta cada uno.
 * Pedido explicito: mas elaborado/prolijo que una simple caja gris -
 * mayor fidelidad visual por tipo de elemento, pero siempre esquematico
 * (sin inventar contenido real ni pedirle nada a la IA).
 */
function ElementBox({ element }: { element: ScreenElement }) {
  if (element.type === 'nav') {
    return (
      <div className="flex items-center gap-1.5 rounded-control bg-surface-container-high px-2.5 py-1.5 text-label-sm font-medium text-on-surface">
        <Icon name={ELEMENT_ICONS.nav} className="text-[14px] text-on-surface-variant" />
        {element.label}
        <DataRefBadge element={element} />
      </div>
    );
  }

  if (element.type === 'button') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-container px-4 py-1.5 text-label-md font-semibold text-on-primary-container shadow-sm">
        <Icon name={ELEMENT_ICONS.button} className="text-[15px]" />
        {element.label}
        <DataRefBadge element={element} />
      </span>
    );
  }

  if (element.type === 'text') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-body-md font-semibold text-on-surface">{element.label}</p>
          <DataRefBadge element={element} />
        </div>
        <div className="h-1.5 w-4/5 rounded-full bg-surface-container-high" />
        <div className="h-1.5 w-3/5 rounded-full bg-surface-container-high" />
      </div>
    );
  }

  if (element.type === 'image') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-label-sm font-medium text-on-surface-variant">
          <Icon name={ELEMENT_ICONS.image} className="text-[15px]" />
          {element.label}
          <DataRefBadge element={element} />
        </div>
        <div
          className="flex h-20 items-center justify-center rounded-control border border-outline-variant/60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, var(--color-surface-container-high) 0 10px, transparent 10px 20px)',
            backgroundColor: 'var(--color-surface-container-lowest)',
          }}
        >
          <Icon name="image" className="text-[28px] text-outline" />
        </div>
      </div>
    );
  }

  if (element.type === 'field') {
    return (
      <div>
        <div className="flex items-center gap-1.5 pl-1 text-label-sm font-medium text-on-surface-variant">
          {element.label}
          <DataRefBadge element={element} />
        </div>
        <div className="mt-0.5 h-9 rounded-control border border-outline-variant bg-surface" />
      </div>
    );
  }

  // form: tarjeta con un encabezado + un par de campos esquematicos.
  if (element.type === 'form') {
    return (
      <div className="space-y-2 rounded-control border border-outline-variant bg-surface p-2.5">
        <div className="flex items-center gap-1.5 text-label-sm font-semibold text-on-surface">
          <Icon name={ELEMENT_ICONS.form} className="text-[15px] text-on-surface-variant" />
          {element.label}
          <DataRefBadge element={element} />
        </div>
        <div className="h-7 rounded-control border border-outline-variant/70 bg-surface-container-lowest" />
        <div className="h-7 w-4/5 rounded-control border border-outline-variant/70 bg-surface-container-lowest" />
      </div>
    );
  }

  // list: tarjeta con 3 filas tipo "lista real" (avatar + 2 lineas de texto).
  return (
    <div className="rounded-control border border-outline-variant bg-surface">
      <div className="flex items-center gap-1.5 border-b border-outline-variant/60 px-2.5 py-1.5 text-label-sm font-semibold text-on-surface">
        <Icon name={ELEMENT_ICONS.list} className="text-[15px] text-on-surface-variant" />
        {element.label}
        <DataRefBadge element={element} />
      </div>
      <div className="divide-y divide-outline-variant/40">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 px-2.5 py-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-surface-container-high" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded-full bg-surface-container-high" style={{ width: `${70 - i * 8}%` }} />
              <div className="h-1.5 w-2/5 rounded-full bg-surface-container-high/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenWireframe({
  screen,
  outgoing,
  onNavigate,
}: {
  screen: Screen;
  outgoing: NavigationEdge[];
  onNavigate: (screenName: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-body-sm text-on-surface-variant">{screen.purpose}</p>

      {/* Marco tipo "pantalla de app": barra de titulo + el contenido esquematico abajo. */}
      <div className="overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-outline-variant/60 bg-surface-container-low px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-outline-variant" />
          <span className="h-2 w-2 rounded-full bg-outline-variant" />
          <span className="h-2 w-2 rounded-full bg-outline-variant" />
          <span className="ml-2 truncate text-label-sm font-semibold text-on-surface-variant">{screen.name}</span>
        </div>
        <div className="space-y-3 p-3">
          {screen.mainElements.map((element, i) => (
            <ElementBox key={i} element={element} />
          ))}
        </div>
      </div>

      <p className="text-label-sm text-outline">Visible para: {screen.visibleToRoles.join(', ')}</p>

      {outgoing.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-label-sm font-semibold uppercase tracking-wide text-outline">
            Modo prototipo — navegar a
          </p>
          <div className="flex flex-wrap gap-2">
            {outgoing.map((edge, i) => (
              <Button key={i} variant="secondary" size="sm" onClick={() => onNavigate(edge.to)}>
                <Icon name="arrow_forward" className="text-[14px]" />
                {edge.label || edge.to} → {edge.to}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// US-027/US-030: el grafo de navegacion se renderiza con mermaid (igual que
// ErDiagram), pero ademas se postprocesa el SVG para que cada nodo
// ("pantalla") sea clickeable y muestre su wireframe en vivo. Hacer click en
// una de las acciones del wireframe navega a la siguiente pantalla
// siguiendo los enlaces reales (screenMap.navigation): es el "prototipo
// clicable" pedido, 100% client-side, sin descargar nada ni volver a
// llamar a la IA.
export function ScreenMapViewer({ diagram, screens, navigation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedScreenName, setSelectedScreenName] = useState<string | null>(null);

  const selectedScreen = screens.find((s) => s.name === selectedScreenName) ?? null;
  const outgoing = selectedScreen ? navigation.filter((edge) => edge.from === selectedScreen.name) : [];

  useEffect(() => {
    setSelectedScreenName(null);
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
        nodeEl.addEventListener('click', () => setSelectedScreenName(screen.name));
      });
    });

    return () => {
      active = false;
    };
  }, [diagram, screens]);

  if (!diagram) {
    return (
      <p className="text-body-sm text-on-surface-variant">Todavía no hay un mapa de pantallas generado.</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
        <Icon name="ads_click" className="text-[16px] text-primary" />
        Hacé click en una pantalla del mapa para ver su maqueta y navegar entre pantallas (modo prototipo).
      </p>

      <Card>
        <div ref={containerRef} data-testid="screen-map-diagram" className="overflow-x-auto" />
      </Card>

      {!selectedScreen && (
        <p className="text-label-sm text-outline">
          Todavía no seleccionaste ninguna pantalla — la maqueta aparece acá abajo al hacer click.
        </p>
      )}

      {selectedScreen && (
        <Card className="border-primary/30 bg-primary-container/10" data-testid="screen-mockup">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-body-sm font-semibold text-on-surface">{selectedScreen.name}</h3>
            <Button variant="secondary" size="sm" onClick={() => setSelectedScreenName(null)}>
              Cerrar
            </Button>
          </div>
          <div className="mt-3">
            <ScreenWireframe screen={selectedScreen} outgoing={outgoing} onNavigate={setSelectedScreenName} />
          </div>
        </Card>
      )}
    </div>
  );
}
