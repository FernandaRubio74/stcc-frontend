import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import {
  advanceDefinitionStage,
  getDefinition,
  postDefinitionMessage,
} from '../../../services/definitionService';
import { ConversationWizard } from './ConversationWizard';
import { ApiError } from '../../../lib/apiClient';
import { AppShell } from '../../../components/AppShell';
import { BackLink } from '../../../components/BackLink';
import { PageHeader } from '../../../components/PageHeader';
import { Alert } from '../../../components/Alert';
import { Skeleton } from '../../../components/Skeleton';
import { useToast } from '../../../components/Toast';
import { StageInconsistencyAlert } from '../../../components/StageInconsistencyAlert';
import { usePrefillInstruction } from '../../../hooks/usePrefillInstruction';
import { getNextStagePath } from '../projectStages';

// Unica etapa del wizard que no tiene una siguiente DENTRO del wizard (ver
// STAGE_ORDER en definition.service.js/ConversationWizard.tsx) - al
// completarla, "Avanzar de etapa" ya no debe llamar a advanceStage (que en
// esta etapa siempre devuelve 409 NoNextStageError, porque no hay una
// sub-etapa interna siguiente) sino navegar directo a la proxima etapa del
// proyecto (Modelo de datos).
const LAST_WIZARD_STAGE = 'TARGET_USERS_SCOPE';

// STCC-93 (US-018): contenedor del wizard — orquesta la query del estado
// de la definicion y las mutaciones de enviar mensaje / avanzar etapa.
export function WizardPage() {
  usePageTitle('Definición del producto');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const prefillInstruction = usePrefillInstruction();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [sendError, setSendError] = useState<string | null>(null);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [stageComplete, setStageComplete] = useState(false);
  // Sugerencias de un click del agente de sugerencias (US de UX del
  // wizard): arrancan con lo que trae la query (ejemplos fijos si la etapa
  // todavia no tiene mensajes) y se reemplazan por las que devuelve cada
  // postMessage, que son las reales, generadas en base a la respuesta del
  // agente principal.
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Etapa para la que una mutacion (enviar mensaje o avanzar) ya puso las
  // sugerencias "buenas" (contextuales, generadas por el agente) de forma
  // directa. Mientras coincida con la etapa que trae el refetch del GET,
  // el efecto de mas abajo no las pisa con el fallback generico del GET -
  // sin esto, el invalidateQueries de cada mutacion dispara un refetch que
  // llegaria despues y reemplazaria la sugerencia contextual por una
  // generica, perdiendo justo el valor de que el agente de sugerencias
  // haya leido la pregunta real.
  const mutationHandledStageRef = useRef<string | null>(null);

  const definitionQueryKey = ['project', projectId, 'definition'];

  const definitionQuery = useQuery({
    queryKey: definitionQueryKey,
    queryFn: () => getDefinition(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // Solo se re-siembra desde el GET mientras la persona todavia no
  // respondio nada en la etapa actual (sin mensajes, o el unico mensaje es
  // el anuncio de cambio de etapa que puso el asistente): en esos casos el
  // GET trae ejemplos fijos de arranque (ver mismo criterio en
  // definition.service.js del backend) - Y solo si esa etapa no fue recien
  // manejada por una mutacion propia (ver `mutationHandledStageRef`).
  useEffect(() => {
    if (!definitionQuery.data) return;
    const data = definitionQuery.data;
    if (mutationHandledStageRef.current === data.currentStage) return;
    const messagesInCurrentStage = data.messages.filter((m) => m.stage === data.currentStage);
    const awaitingFirstReplyInStage = messagesInCurrentStage.every((m) => m.role === 'assistant');
    if (awaitingFirstReplyInStage) {
      setSuggestions(data.suggestions);
    }
    // El GET ahora trae stageComplete (antes solo lo traia el resultado de
    // postMessage) - sin esto, recargar la pagina en una etapa ya completa
    // perdia el banner de "etapa completa" y el boton volvia al estado
    // "todavia podes seguir respondiendo".
    setStageComplete(data.stageComplete);
  }, [definitionQuery.data]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      postDefinitionMessage(projectId as string, content, token as string),
    // Las sugerencias respondian a la pregunta anterior - apenas se manda
    // un mensaje nuevo dejan de ser validas, para no invitar a un click
    // sobre una opcion que ya no tiene sentido mientras se espera la
    // respuesta.
    onMutate: () => {
      setSuggestions([]);
    },
    onSuccess: (result) => {
      setSendError(null);
      setStageComplete(result.stageComplete);
      setSuggestions(result.suggestions);
      mutationHandledStageRef.current = result.stage;
      queryClient.invalidateQueries({ queryKey: definitionQueryKey });
      // Sin esto, el aviso de conflicto (StageInconsistencyAlert) quedaba
      // pegado con el mensaje viejo aunque la respuesta ya haya resuelto
      // el conflicto, porque esa query tiene su propia key.
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'consistency-check'] });
    },
    onError: (error: unknown) => {
      setSendError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const advanceMutation = useMutation({
    mutationFn: () => advanceDefinitionStage(projectId as string, token as string),
    onSuccess: (result) => {
      setAdvanceError(null);
      setStageComplete(false);
      // El backend ya persistio el anuncio de cambio de etapa como mensaje
      // del asistente - el refetch que dispara invalidateQueries lo trae.
      // Las sugerencias para responderlo si vienen en esta respuesta (no
      // se persisten), asi que se setean directo.
      setSuggestions(result.suggestions);
      mutationHandledStageRef.current = result.currentStage;
      queryClient.invalidateQueries({ queryKey: definitionQueryKey });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'consistency-check'] });
      showToast('Etapa avanzada');
    },
    onError: (error: unknown) => {
      setAdvanceError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (definitionQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (definitionQuery.isError || !definitionQuery.data) {
    return (
      <AppShell>
        <Alert onRetry={() => definitionQuery.refetch()}>
          {definitionQuery.error instanceof ApiError
            ? definitionQuery.error.message
            : 'No se pudo cargar la conversación'}
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const definition = definitionQuery.data;
  const isLastWizardStage = definition.currentStage === LAST_WIZARD_STAGE;

  // En la ultima etapa del wizard ya completa, no hay una sub-etapa interna
  // siguiente a la que "avanzar" (advanceStage devolveria 409 sin hacer
  // nada util) - el boton pasa a llevar directo a la proxima etapa real
  // del proyecto (Modelo de datos).
  function handleAdvance() {
    if (isLastWizardStage && stageComplete) {
      const nextPath = getNextStagePath(projectId as string, 'wizard');
      if (nextPath) navigate(nextPath);
      return;
    }
    advanceMutation.mutate();
  }

  return (
    <AppShell>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader title="Definición del producto" />

      <StageInconsistencyAlert projectId={projectId as string} ruleStage="definition" />

      <ConversationWizard
        stage={definition.currentStage}
        messages={definition.messages}
        blockingQuestions={definition.blockingQuestions}
        stageComplete={stageComplete}
        suggestions={suggestions}
        onSendMessage={(content) => sendMutation.mutate(content)}
        isSending={sendMutation.isPending}
        sendError={sendError}
        onAdvance={handleAdvance}
        isAdvancing={advanceMutation.isPending}
        advanceError={advanceError}
        advanceLabel={isLastWizardStage ? 'Ir al modelo de datos' : 'Avanzar de etapa'}
        initialDraft={prefillInstruction}
      />
    </AppShell>
  );
}
