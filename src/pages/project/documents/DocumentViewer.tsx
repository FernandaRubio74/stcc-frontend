import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import type { GeneratedDocument } from '../../../types/documents';
import { DOCUMENT_KIND_LABELS } from '../../../types/documents';

mermaid.initialize({ startOnLoad: false });

/**
 * Los documentos generados traen los diagramas como bloques ```mermaid (el
 * backend los incrusta ya armados). Se renderizan con el mismo enfoque que
 * ErDiagram/ScreenMapViewer en vez de mostrarlos como codigo.
 */
function MermaidBlock({ diagram }: { diagram: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let active = true;
    const id = `doc-diagram-${Math.random().toString(36).slice(2)}`;

    mermaid
      .render(id, diagram)
      .then(({ svg }) => {
        if (active && containerRef.current) containerRef.current.innerHTML = svg;
      })
      .catch(() => {
        // Un diagrama invalido no debe tumbar la vista previa del documento.
        if (active && containerRef.current) containerRef.current.textContent = diagram;
      });

    return () => {
      active = false;
    };
  }, [diagram]);

  return <div ref={containerRef} data-testid="mermaid-block" className="overflow-x-auto py-2" />;
}

interface Props {
  document: GeneratedDocument;
  onDownload: () => void;
}

// T-037.1/T-037.2: vista previa renderizada (Markdown -> HTML) del documento
// seleccionado, con su descarga individual. Es presentacional: no sabe de
// queries ni de rutas.
export function DocumentViewer({ document, onDownload }: Props) {
  return (
    <section className="space-y-4 rounded-md border border-gray-200 bg-white p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{DOCUMENT_KIND_LABELS[document.kind]}</h2>
          <p className="text-xs text-gray-500">
            Versión {document.versionNumber} · generado el {new Date(document.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="rounded-md border border-indigo-600 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        >
          Descargar .md
        </button>
      </header>

      <article className="prose prose-sm max-w-none overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const isMermaid = (className || '').includes('language-mermaid');
              if (isMermaid) return <MermaidBlock diagram={String(children).trim()} />;
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {document.content}
        </ReactMarkdown>
      </article>
    </section>
  );
}
