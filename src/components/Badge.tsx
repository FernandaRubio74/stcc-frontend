type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface Props {
  tone?: Tone;
  children: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-indigo-50 text-indigo-700',
};

// T-043.1: mismo patron visual que ya usaban a mano ReviewChecklist (estados
// completo/pendiente/con conflicto) y VersionList (badge "ultima").
export function Badge({ tone = 'neutral', children }: Props) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>{children}</span>;
}
