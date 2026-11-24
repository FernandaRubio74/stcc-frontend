import { Modal } from './Modal';
import { Button } from './Button';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Confirmacion de acciones destructivas (eliminar miembro, etc. - Fase 4).
// Antes esas acciones se disparaban directo al click, sin paso intermedio.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  tone = 'primary',
  isConfirming = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-body-sm text-on-surface-variant">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
          Cancelar
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={isConfirming}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
