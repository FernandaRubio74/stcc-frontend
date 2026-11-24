import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Alert } from './Alert';
import { Icon } from './icons';
import { Textarea } from './Textarea';

interface Props {
  /** Id unico de la instancia (ej. "data-model"), para los ids de los campos. */
  id: string;
  /** Texto de ayuda especifico de la etapa (ej. "Agrega una entidad Proveedor con..."). */
  placeholder: string;
  onSubmit: (instruction: string) => Promise<unknown>;
  disabled?: boolean;
  disabledReason?: string;
  /** Precarga el campo (ej. al llegar desde "Ir a X a resolverlo" en Revision final, con la instruccion ya armada). */
  initialInstruction?: string;
}

// Chatbot transversal (pedido explicito): antes la unica forma de corregir
// algo ya generado era volver a la etapa de Definicion y esperar que esa
// conversacion de alto nivel se tradujera, etapas despues, en el detalle
// necesario - en la practica no funcionaba. Este mismo componente se usa en
// cada etapa posterior (modelo de datos, API, pantallas, arquitectura,
// pruebas): la instruccion se aplica DIRECTO sobre el contenido ya
// generado de esa etapa especifica (ver POST .../refine de cada modulo).
export function StageAssistant({ id, placeholder, onSubmit, disabled, disabledReason, initialInstruction }: Props) {
  const [instruction, setInstruction] = useState(initialInstruction ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!instruction.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(instruction.trim());
      setInstruction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="space-y-space-sm">
      <div className="flex items-center gap-space-xs">
        <Icon name="chat" className="text-primary" />
        <h3 className="text-label-lg font-semibold text-on-surface">Ajustar con IA</h3>
      </div>
      {disabled ? (
        <p className="text-body-sm text-on-surface-variant">{disabledReason}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-space-sm">
          <Textarea
            id={`stage-assistant-${id}`}
            label="Describí el cambio que querés aplicar"
            hideLabel
            placeholder={placeholder}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            rows={2}
            disabled={isSubmitting}
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" size="sm" loading={isSubmitting} disabled={!instruction.trim()}>
            <Icon name="auto_awesome" className="text-[16px]" />
            Aplicar con IA
          </Button>
        </form>
      )}
    </Card>
  );
}
