import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import {
  advanceDefinitionStage,
  getDefinition,
  postDefinitionMessage,
} from '../../../services/definitionService';
import { ConversationWizard } from './ConversationWizard';
import { ApiError } from '../../../lib/apiClient';

// STCC-93 (US-018): contenedor del wizard — orquesta la query del estado
// de la definicion y las mutaciones de enviar mensaje / avanzar etapa.
export function WizardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [sendError, setSendError] = useState<string | null>(null);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [stageComplete, setStageComplete] = useState(false);

  const definitionQueryKey = ['project', projectId, 'definition'];

  const definitionQuery = useQuery({
    queryKey: definitionQueryKey,
    queryFn: () => getDefinition(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => postDefinitionMessage(projectId as string, content, token as string),
    onSuccess: (result) => {
      setSendError(null);
      setStageComplete(result.stageComplete);
      queryClient.invalidateQueries({ queryKey: definitionQueryKey });
    },
    onError: (error: unknown) => {
      setSendError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const advanceMutation = useMutation({
    mutationFn: () => advanceDefinitionStage(projectId as string, token as string),
    onSuccess: () => {
      setAdvanceError(null);
      setStageComplete(false);
      queryClient.invalidateQueries({ queryKey: definitionQueryKey });
    },
    onError: (error: unknown) => {
      setAdvanceError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (definitionQuery.isPending) {
    return <p className="p-8 text-sm text-gray-500">Cargando…</p>;
  }

  if (definitionQuery.isError || !definitionQuery.data) {
    return (
      <div className="space-y-3 p-8">
        <p role="alert" className="text-sm text-red-700">
          {definitionQuery.error instanceof ApiError
            ? definitionQuery.error.message
            : 'No se pudo cargar la conversación'}
        </p>
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          Volver al proyecto
        </Link>
      </div>
    );
  }

  const definition = definitionQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          ← Volver al proyecto
        </Link>

        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Definición del producto</h1>
        </header>

        <ConversationWizard
          stage={definition.currentStage}
          messages={definition.messages}
          blockingQuestions={definition.blockingQuestions}
          stageComplete={stageComplete}
          onSendMessage={(content) => sendMutation.mutate(content)}
          isSending={sendMutation.isPending}
          sendError={sendError}
          onAdvance={() => advanceMutation.mutate()}
          isAdvancing={advanceMutation.isPending}
          advanceError={advanceError}
        />
      </div>
    </div>
  );
}
