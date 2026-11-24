import { Button } from './Button';
import { Icon } from './icons';
import { Alert } from './Alert';

/**
 * Estado inicial de una etapa que todavia no genero nada.
 *
 * Antes era un boton "Generar con IA" solo, flotando en una pagina vacia:
 * no decia de donde sale lo que va a generar, que se obtiene, ni que pasa
 * despues, y se veia como un error de maquetado mas que como una accion.
 * Este panel responde esas tres cosas antes de pedir el click, que es lo
 * que vuelve entendible una accion que cuesta tiempo y dinero (una llamada
 * real al modelo).
 *
 * No reemplaza al boton "Generar nueva version" de la barra superior: ese
 * aparece cuando YA hay contenido. Este es solo el punto de entrada.
 */

interface Props {
  /** Titulo de lo que se va a generar, ej. "el modelo de datos". */
  title: string;
  /** Una frase de que hace esta etapa. */
  description: string;
  /** De donde sale la informacion (etapas previas ya aprobadas). */
  inputs: string[];
  /** Que queda al terminar. */
  outputs: string[];
  ctaLabel: string;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
  /** Si no puede generar (rol sin permiso), se explica en vez de ocultar todo. */
  disabled?: boolean;
  disabledReason?: string;
}

export function StageGenerateCard({
  title,
  description,
  inputs,
  outputs,
  ctaLabel,
  onGenerate,
  isGenerating,
  error,
  disabled = false,
  disabledReason,
}: Props) {
  return (
    <section className="overflow-hidden rounded-card border border-outline-variant/40 bg-surface-container-low shadow-sm">
      <div className="flex flex-col gap-space-lg p-space-xl md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-prose gap-space-md">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
            <Icon name="auto_awesome" />
          </span>
          <div className="min-w-0">
            <h2 className="text-title-lg font-semibold text-on-surface">Generemos {title}</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p>

            <dl className="mt-space-lg grid gap-space-md sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  <Icon name="input" className="text-[16px]" />
                  Se basa en
                </dt>
                <ul className="mt-1 space-y-0.5 text-body-sm text-on-surface-variant">
                  {inputs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  <Icon name="task_alt" className="text-[16px]" />
                  Vas a obtener
                </dt>
                <ul className="mt-1 space-y-0.5 text-body-sm text-on-surface-variant">
                  {outputs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1.5">
          <Button onClick={onGenerate} loading={isGenerating} disabled={disabled} size="lg">
            <Icon name="auto_awesome" className="text-[18px]" />
            {ctaLabel}
          </Button>
          <p className="text-label-sm text-outline">
            {isGenerating ? 'Puede tardar hasta un minuto.' : 'Tarda menos de un minuto.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm border-t border-outline-variant/40 bg-surface-container/40 px-space-xl py-space-md">
        <p className="flex items-start gap-1.5 text-label-sm text-on-surface-variant">
          <Icon name="edit_note" className="text-[16px] shrink-0" />
          Lo que se genere queda como borrador: podés ajustarlo con el chat o a mano, y recién después lo aprobás.
        </p>
        {disabled && disabledReason && <p className="text-label-sm text-on-surface-variant">{disabledReason}</p>}
      </div>

      {error && (
        <div className="px-space-xl pb-space-lg">
          <Alert>{error}</Alert>
        </div>
      )}
    </section>
  );
}
