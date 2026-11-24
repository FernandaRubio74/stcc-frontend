import type { DocumentKind, DocumentVersion } from '../../../types/documents';
import { DOCUMENT_KIND_LABELS } from '../../../types/documents';
import { Badge } from '../../../components/Badge';
import { Icon } from '../../../components/icons';

const KIND_ORDER: DocumentKind[] = ['SPEC', 'ARCHITECTURE'];
const KIND_ICON: Record<DocumentKind, string> = {
  SPEC: 'description',
  ARCHITECTURE: 'schema',
};

interface Props {
  versions: DocumentVersion[];
  selectedId: string | null;
  onSelect: (documentId: string) => void;
}

// T-037.3: historial de versiones generadas, agrupado por tipo de documento.
// El backend versiona cada tipo por separado, asi que la lista refleja eso.
// Anatomia tipo "navegador de archivos" (ver DESIGN.md: barra de acento +
// icono + nombre + fecha), sin el contador de "N archivos" del mockup (no
// es un dato que valga la pena fijar aparte del propio listado).
export function VersionList({ versions, selectedId, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-space-md">
      {KIND_ORDER.map((kind) => {
        const delTipo = versions
          .filter((version) => version.kind === kind)
          .sort((a, b) => b.versionNumber - a.versionNumber);

        return (
          <section key={kind} className="flex flex-col gap-space-xs">
            <span className="text-label-sm font-semibold uppercase tracking-wide text-outline">
              {DOCUMENT_KIND_LABELS[kind]}
            </span>

            {delTipo.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">Sin versiones generadas</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {delTipo.map((version, index) => {
                  const isSelected = version.id === selectedId;
                  return (
                    <li key={version.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(version.id)}
                        aria-current={isSelected}
                        className={`relative flex w-full flex-col gap-1 overflow-hidden rounded-lg p-space-sm text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? 'bg-surface-container-high shadow-sm'
                            : 'text-on-surface-variant hover:bg-surface-container-high/60'
                        }`}
                      >
                        {isSelected && <span className="absolute inset-y-0 left-0 w-1 bg-primary" />}
                        <span className="flex items-center justify-between gap-2 pl-1">
                          <span className="flex items-center gap-1.5 text-body-sm font-medium text-on-surface">
                            <Icon name={KIND_ICON[kind]} className={`text-[16px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                            Versión {version.versionNumber}
                          </span>
                          {index === 0 && <Badge tone="success">última</Badge>}
                        </span>
                        <span className="pl-1 font-mono text-[11px] text-outline">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </nav>
  );
}
