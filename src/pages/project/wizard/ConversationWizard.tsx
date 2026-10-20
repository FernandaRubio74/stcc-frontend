import { useState, type FormEvent } from 'react';
import type { BlockingQuestion, DefinitionMessage, DefinitionStage } from '../../../types/definition';

const STAGE_ORDER: DefinitionStage[] = ['PROBLEM_CONTEXT', 'TARGET_USERS_SCOPE'];

const STAGE_LABELS: Record<DefinitionStage, string> = {
  PROBLEM_CONTEXT: 'Problema y contexto',
  TARGET_USERS_SCOPE: 'Usuarios y alcance del MVP',
};

interface ConversationWizardProps {
  stage: DefinitionStage;
  messages: DefinitionMessage[];
  blockingQuestions: BlockingQuestion[];
  stageComplete: boolean;
  onSendMessage: (content: string) => void;
  isSending: boolean;
  sendError: string | null;
  onAdvance: () => void;
  isAdvancing: boolean;
  advanceError: string | null;
}

// STCC-93 (US-018): wizard conversacional. El avance de etapa se bloquea en
// el cliente en cuanto hay blocking questions (lo mismo que ya valida el
// backend en T-017.2) para no depender de que el usuario intente y falle.
export function ConversationWizard({
  stage,
  messages,
  blockingQuestions,
  stageComplete,
  onSendMessage,
  isSending,
  sendError,
  onAdvance,
  isAdvancing,
  advanceError,
}: ConversationWizardProps) {
  const [draft, setDraft] = useState('');
  const isBlocked = blockingQuestions.length > 0;
  const currentStageIndex = STAGE_ORDER.indexOf(stage);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    onSendMessage(content);
    setDraft('');
  }

  return (
    <div className="space-y-4">
      <ol className="flex items-center gap-2" aria-label="Progreso del wizard">
        {STAGE_ORDER.map((s, index) => {
          const isCurrent = s === stage;
          const isDone = index < currentStageIndex;
          return (
            <li
              key={s}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-medium ${
                isCurrent
                  ? 'bg-indigo-600 text-white'
                  : isDone
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {STAGE_LABELS[s]}
            </li>
          );
        })}
      </ol>

      {isBlocked && (
        <div role="alert" className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800">
            Hay preguntas bloqueantes sin resolver — no se puede avanzar de etapa:
          </p>
          <ul className="list-inside list-disc text-sm text-amber-800">
            {blockingQuestions.map((q) => (
              <li key={q.id}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
        {messages.length === 0 && (
          <li className="text-sm text-gray-500">Todavía no hay mensajes. Contale a Ideator en qué estás pensando.</li>
        )}
        {messages.map((message) => (
          <li
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <p
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </p>
          </li>
        ))}
      </ul>

      {sendError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {sendError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label className="sr-only" htmlFor="wizard-message">
          Tu respuesta
        </label>
        <input
          id="wizard-message"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isSending}
          placeholder="Escribí tu respuesta…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      {advanceError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {advanceError}
        </p>
      )}

      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
        <p className="text-xs text-gray-500">
          {isBlocked
            ? 'Resolvé las preguntas bloqueantes para poder avanzar.'
            : stageComplete
              ? 'Esta etapa está completa.'
              : 'Todavía podés seguir respondiendo antes de avanzar.'}
        </p>
        <button
          type="button"
          onClick={onAdvance}
          disabled={isBlocked || isAdvancing}
          className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAdvancing ? 'Avanzando…' : 'Avanzar de etapa'}
        </button>
      </div>
    </div>
  );
}
