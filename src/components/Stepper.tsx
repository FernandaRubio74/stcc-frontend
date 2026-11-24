import { Link } from 'react-router-dom';
import { Tooltip } from './Tooltip';
import { CheckIcon, LockIcon } from './icons';

export type StepStatus = 'completed' | 'current' | 'available' | 'locked';

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
  /** Ruta a navegar si el paso no esta locked. Si falta, el paso no es clickeable. */
  to?: string;
  /** Explica que falta para desbloquear - obligatorio en la practica para status="locked". */
  lockedReason?: string;
}

interface Props {
  steps: Step[];
}

// Ver DESIGN.md "Segmented Stage Progression Bar": completada = linea/texto
// esmeralda, activa = fill solido indigo, bloqueada = borde apagado + icono
// de candado, nunca solo un cambio de color.
const STATUS_CLASSES: Record<StepStatus, string> = {
  completed: 'bg-tertiary-container/20 text-tertiary',
  current: 'bg-primary-container text-on-primary-container shadow-sm',
  available: 'bg-surface-container-high text-on-surface hover:bg-surface-variant',
  locked: 'bg-surface-container/40 text-outline opacity-70',
};

// Usado tanto para la navegacion entre etapas del proyecto (Fase 3) como
// para el progreso de 2 pasos del wizard (reemplaza el <ol> que armaba a
// mano ConversationWizard). El estado nunca se comunica solo con color:
// "completed" ademas lleva el icono de check, y "locked" lleva tooltip.
export function Stepper({ steps }: Props) {
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Progreso">
      {steps.map((step) => {
        const content = (
          <span
            className={`flex items-center gap-1.5 rounded-control px-space-md py-space-sm text-label-md font-medium transition ${STATUS_CLASSES[step.status]}`}
          >
            {step.status === 'completed' && <CheckIcon className="h-3.5 w-3.5" />}
            {step.status === 'locked' && <LockIcon className="h-3.5 w-3.5" />}
            {step.label}
          </span>
        );

        const inner =
          step.status === 'locked' ? (
            <Tooltip
              content={step.lockedReason ?? 'Completá la etapa anterior para desbloquear esta.'}
            >
              <span tabIndex={0}>{content}</span>
            </Tooltip>
          ) : step.to ? (
            <Link to={step.to}>{content}</Link>
          ) : (
            content
          );

        return (
          <li key={step.id} aria-current={step.status === 'current' ? 'step' : undefined}>
            {inner}
          </li>
        );
      })}
    </ol>
  );
}
