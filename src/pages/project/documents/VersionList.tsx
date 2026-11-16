import type { DocumentKind, DocumentVersion } from '../../../types/documents';
import { DOCUMENT_KIND_LABELS } from '../../../types/documents';

const KIND_ORDER: DocumentKind[] = ['SPEC', 'ARCHITECTURE'];

interface Props {
  versions: DocumentVersion[];
  selectedId: string | null;
  onSelect: (documentId: string) => void;
}

// T-037.3: historial de versiones generadas, agrupado por tipo de documento.
// El backend versiona cada tipo por separado, asi que la lista refleja eso.
export function VersionList({ versions, selectedId, onSelect }: Props) {
  return (
    <nav className="space-y-4">
      {KIND_ORDER.map((kind) => {
        const delTipo = versions
          .filter((version) => version.kind === kind)
          .sort((a, b) => b.versionNumber - a.versionNumber);

        return (
          <section key={kind} className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {DOCUMENT_KIND_LABELS[kind]}
            </h3>

            {delTipo.length === 0 ? (
              <p className="text-sm text-gray-500">Sin versiones generadas</p>
            ) : (
              <ul className="space-y-1">
                {delTipo.map((version, index) => (
                  <li key={version.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(version.id)}
                      aria-current={version.id === selectedId}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                        version.id === selectedId ? 'bg-indigo-50 font-medium text-indigo-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>Versión {version.versionNumber}</span>
                      {index === 0 && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">última</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </nav>
  );
}
