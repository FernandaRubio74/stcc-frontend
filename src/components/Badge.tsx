export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type Tone = BadgeTone;

interface Props {
  tone?: Tone;
  children: string;
}

// Ver DESIGN.md "Chips & Technical Badges": fondo con tinte de baja opacidad
// + texto de alto contraste + borde en hairline a juego.
const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-surface-variant text-outline border border-outline-variant/40',
  success: 'bg-tertiary-container/20 text-tertiary border border-tertiary/20',
  warning: 'bg-warning-container/30 text-warning border border-warning/20',
  danger: 'bg-danger-container/40 text-danger border border-danger/20',
  info: 'bg-secondary-container/20 text-secondary border border-secondary/20',
};

// T-043.1: mismo patron visual que ya usaban a mano ReviewChecklist (estados
// completo/pendiente/con conflicto) y VersionList (badge "ultima").
export function Badge({ tone = 'neutral', children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label-sm font-medium uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
