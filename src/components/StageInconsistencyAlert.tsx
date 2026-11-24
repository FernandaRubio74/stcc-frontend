import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getConsistencyCheck } from '../services/reviewService';
import { Alert } from './Alert';

// Pedido explicito: antes, si el motor de consistencia (US-031) detectaba
// un conflicto entre etapas, solo se veia en Revision final - al llegar a
// la etapa en cuestion para arreglarlo, no habia ningun rastro de cual era
// el problema ni como resolverlo. Este componente lo muestra en el lugar
// donde hay que arreglarlo, filtrado a las inconsistencias que involucran
// ESTA etapa.
//
// Revision transversal (reglas A, D y E):
// - Las reglas que todavia no se pueden evaluar porque falta generar una
//   etapa llegan en `checks` con estado "pendiente", NO en `issues`, asi
//   que este componente no las muestra: una etapa sin generar no es un
//   problema que el usuario tenga que resolver.
// - La sugerencia la redacta el backend (`issue.suggestion`): es la unica
//   fuente de verdad, no se vuelve a inventar en el cliente.
// - `pendingApproval` explica el caso que mas confundia: ajustar con IA
//   crea un BORRADOR, y el motor solo mira versiones aprobadas, asi que
//   hasta aprobar el hallazgo sigue ahi aunque el borrador ya este bien.

interface Props {
  projectId: string;
  /** Id de etapa que usa el motor de consistencia (kebab-case: "definition" | "data-model" | "api-spec" | "screens"). */
  ruleStage: string;
}

export function StageInconsistencyAlert({ projectId, ruleStage }: Props) {
  const { token } = useAuth();

  const query = useQuery({
    queryKey: ['project', projectId, 'consistency-check'],
    queryFn: () => getConsistencyCheck(projectId, token as string),
    enabled: Boolean(token && projectId),
  });

  const relevant = (query.data?.issues ?? []).filter((issue) => issue.stages.includes(ruleStage));
  if (relevant.length === 0) return null;

  const hasError = relevant.some((issue) => issue.status === 'error' || !issue.status);
  const hasPendingDraft = (query.data?.pendingApproval ?? []).includes(ruleStage);

  const title = hasError
    ? relevant.length === 1
      ? 'Hay una inconsistencia con otra etapa'
      : 'Hay inconsistencias con otras etapas'
    : 'Aviso de consistencia (no bloquea)';

  return (
    <Alert tone={hasError ? 'danger' : 'warning'}>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-1 space-y-2">
        {relevant.map((issue, i) => (
          <li key={issue.id ?? i}>
            <p>{issue.message}</p>
            {issue.suggestion && (
              <p className="mt-0.5 text-label-sm text-on-surface-variant">{issue.suggestion}</p>
            )}
          </li>
        ))}
      </ul>
      {hasPendingDraft && (
        <p className="mt-2 border-t border-outline-variant/30 pt-2 text-label-sm font-medium text-on-surface-variant">
          Tenés una versión sin aprobar en esta etapa. Este chequeo solo mira la versión{' '}
          <strong>aprobada</strong> — aprobá los cambios para que se vuelva a revisar.
        </p>
      )}
    </Alert>
  );
}
