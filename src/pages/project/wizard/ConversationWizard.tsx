import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type {
  BlockingQuestion,
  DefinitionMessage,
  DefinitionStage,
} from '../../../types/definition';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { Textarea } from '../../../components/Textarea';
import { Icon } from '../../../components/icons';

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
  /** Respuestas de un click que propone el agente de sugerencias (separado
   * del que conduce la conversacion), para no obligar a escribir todo a
   * mano. Elegir una la carga en el campo de texto - el chat libre sigue
   * siempre disponible para editarla, completarla o escribir otra cosa. */
  suggestions: string[];
  onSendMessage: (content: string) => void;
  isSending: boolean;
  sendError: string | null;
  onAdvance: () => void;
  isAdvancing: boolean;
  advanceError: string | null;
  /** Texto del boton de avanzar - distinto en la ultima etapa del wizard, donde ya no avanza una sub-etapa interna sino que lleva a la siguiente etapa real del proyecto. */
  advanceLabel?: string;
  /** Precarga el campo (ej. al llegar desde "Ir a Definición a resolverlo" en Revision final). */
  initialDraft?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Ver DESIGN.md "Project Spec Metadata Strip" / sub-etapas en pildoras: la
// etapa actual (y las que ya pasaron) van como pildora, el resto bloqueada
// con icono de candado - sin el 3er sub-stage inventado del mockup ("Matriz
// de valor y releases"), que no existe en el modelo real (solo hay 2).
function SubStagePills({ stage }: { stage: DefinitionStage }) {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  return (
    <ol className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-container-low px-2 py-1.5 shadow-sm" aria-label="Sub-etapas">
      <span className="px-2 text-label-sm uppercase tracking-wider text-outline">Sub-etapas:</span>
      {STAGE_ORDER.map((s, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={s} aria-current={active ? 'step' : undefined}>
            <span
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-label-md ${
                active
                  ? 'bg-primary-container font-semibold text-on-primary-container shadow-sm'
                  : done
                    ? 'bg-tertiary-container/30 text-tertiary'
                    : 'bg-surface-container-high/60 text-outline'
              }`}
            >
              {done && <Icon name="check_circle" className="text-[16px]" filled />}
              {active && <span className="h-2 w-2 rounded-full bg-secondary" />}
              <span aria-hidden="true">{index + 1}.</span>
              <span>{STAGE_LABELS[s]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function MessageBubble({ message }: { message: DefinitionMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-space-md">
        <div className="flex max-w-[80%] flex-col items-end gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-mono text-[11px] text-outline">{formatTime(message.createdAt)}</span>
            <span className="text-label-md font-semibold text-on-surface">Tú</span>
          </div>
          <div className="rounded-2xl rounded-tr-sm bg-primary-container px-space-lg py-3 text-on-primary-container shadow-md">
            <p className="text-body-md font-medium">{message.content}</p>
          </div>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high shadow-md">
          <Icon name="person" className="text-on-surface-variant" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-space-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high shadow-md">
        <Icon name="smart_toy" className="text-secondary" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="text-label-md font-semibold text-on-surface">GENIAL</span>
          <span className="font-mono text-[11px] text-outline">{formatTime(message.createdAt)}</span>
        </div>
        <div className="rounded-2xl bg-surface-container p-space-lg shadow-lg">
          <p className="whitespace-pre-wrap text-body-md leading-relaxed text-on-surface">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

// STCC-93 (US-018): wizard conversacional. El avance de etapa se bloquea en
// el cliente en cuanto hay blocking questions (lo mismo que ya valida el
// backend en T-017.2) para no depender de que el usuario intente y falle.
export function ConversationWizard({
  stage,
  messages,
  blockingQuestions,
  stageComplete,
  suggestions,
  onSendMessage,
  isSending,
  sendError,
  onAdvance,
  isAdvancing,
  advanceError,
  advanceLabel = 'Avanzar de etapa',
  initialDraft,
}: ConversationWizardProps) {
  const [draft, setDraft] = useState(initialDraft ?? '');
  const isBlocked = blockingQuestions.length > 0;
  const historyRef = useRef<HTMLUListElement>(null);

  function handleSuggestionClick(suggestion: string) {
    setDraft(suggestion);
  }

  // Autoscroll al mensaje mas reciente - antes el historial se quedaba
  // "parado" arriba cuando crecia por encima de la altura visible.
  useEffect(() => {
    const el = historyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    onSendMessage(content);
    setDraft('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <SubStagePills stage={stage} />

      {isBlocked && (
        <div role="alert" className="flex flex-col gap-2 rounded-card bg-danger-container/20 p-space-md">
          <span className="flex items-center gap-1.5 self-start rounded bg-danger-container/60 px-2 py-0.5 text-label-sm font-semibold text-on-danger-container">
            <Icon name="crisis_alert" className="text-[14px]" />
            Pregunta bloqueante requerida para cerrar alcance
          </span>
          <ul className="list-inside list-disc text-body-sm text-on-surface">
            {blockingQuestions.map((q) => (
              <li key={q.id}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}

      <ul
        ref={historyRef}
        className="flex max-h-[32rem] flex-col gap-space-xl overflow-y-auto rounded-card border border-outline-variant/30 bg-surface p-space-lg scroll-smooth motion-reduce:scroll-auto"
      >
        {messages.length === 0 && (
          <li className="text-body-sm text-on-surface-variant">
            Todavía no hay mensajes. Contale a GENIAL en qué estás pensando.
          </li>
        )}
        {messages.map((message) => (
          <li key={message.id}>
            <MessageBubble message={message} />
          </li>
        ))}
        {isSending && (
          <li className="flex items-start gap-space-md">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high shadow-md">
              <Icon name="smart_toy" className="text-secondary" />
            </span>
            <span
              className="flex items-center gap-1 rounded-2xl bg-surface-container px-space-lg py-3 text-body-sm text-on-surface-variant"
              aria-live="polite"
            >
              GENIAL está escribiendo
              <span className="flex gap-0.5" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:150ms] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:300ms] motion-reduce:animate-none" />
              </span>
            </span>
          </li>
        )}
      </ul>

      {sendError && <Alert>{sendError}</Alert>}

      {!isSending && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Respuestas sugeridas">
          <span className="flex items-center gap-1 text-label-sm text-outline">
            <Icon name="auto_awesome" className="text-[14px]" />
            Sugerencias:
          </span>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="max-w-full rounded-full bg-surface-container-high px-3 py-1.5 text-left text-body-sm text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-space-sm rounded-2xl bg-surface-container-high p-2 shadow-xl">
        <div className="min-w-0 flex-1 py-1">
          <Textarea
            id="wizard-message"
            label="Tu respuesta"
            hideLabel
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder="Escribí tu respuesta, o elegí una sugerencia… (Enter envía, Shift+Enter hace un salto de línea)"
            className="resize-none border-none bg-transparent shadow-none focus:ring-0"
          />
        </div>
        <Button type="submit" disabled={!draft.trim()} loading={isSending} className="shrink-0">
          Enviar
          <Icon name="send" className="text-[16px]" />
        </Button>
      </form>

      {advanceError && <Alert>{advanceError}</Alert>}

      {!isBlocked && stageComplete ? (
        <Alert tone="success">
          <div className="flex items-center justify-between gap-3">
            <span>Esta etapa está completa.</span>
            <Button size="sm" onClick={onAdvance} loading={isAdvancing}>
              {advanceLabel}
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-card border border-outline-variant/30 bg-surface-container-low p-3">
          <p className="text-label-md text-on-surface-variant">
            {isBlocked
              ? 'Resolvé las preguntas bloqueantes para poder avanzar.'
              : 'Todavía podés seguir respondiendo antes de avanzar.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAdvance}
            disabled={isBlocked}
            loading={isAdvancing}
          >
            Avanzar de etapa
          </Button>
        </div>
      )}
    </div>
  );
}
