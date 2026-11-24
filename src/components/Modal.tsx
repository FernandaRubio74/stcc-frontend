import { useEffect, useRef, useState, type ReactNode } from 'react';
import { XIcon } from './icons';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal base (creacion de proyecto, ConfirmDialog, etc.). Maneja lo que
 * cada pantalla no deberia tener que repetir: Escape cierra, click en el
 * fondo cierra, el foco entra al dialogo al abrir y vuelve a donde estaba
 * al cerrar (antes no habia ningun modal en la app, asi que no se rompe
 * nada existente).
 */
export function Modal({ open, title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Entra en 2 pasos (montar en el estado "oculto", despues pasar a
  // "visible" un frame mas tarde) para que la transicion de opacidad/escala
  // se dispare - si ambas clases se aplicaran en el mismo render no habria
  // cambio de estilo que animar.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const frame = requestAnimationFrame(() => setEntered(true));

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-surface-dim/80 transition-opacity duration-200 motion-reduce:transition-none ${entered ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`relative w-full max-w-md rounded-dialog border border-outline-variant/30 bg-surface-container-high p-space-xl shadow-floating transition duration-200 motion-reduce:transition-none focus:outline-none ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="modal-title" className="text-headline-md text-on-surface">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-control"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
