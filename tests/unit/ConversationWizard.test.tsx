import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationWizard } from '../../src/pages/project/wizard/ConversationWizard';
import type { BlockingQuestion, DefinitionMessage } from '../../src/types/definition';

const USER_MSG: DefinitionMessage = {
  id: 'm1',
  stage: 'PROBLEM_CONTEXT',
  role: 'user',
  content: 'Quiero resolver la demora en atención al cliente',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const ASSISTANT_MSG: DefinitionMessage = {
  id: 'm2',
  stage: 'PROBLEM_CONTEXT',
  role: 'assistant',
  content: '¿En qué canal se da esa demora?',
  createdAt: '2026-01-01T00:01:00.000Z',
};

function baseProps() {
  return {
    stage: 'PROBLEM_CONTEXT' as const,
    messages: [USER_MSG, ASSISTANT_MSG],
    blockingQuestions: [] as BlockingQuestion[],
    stageComplete: false,
    onSendMessage: vi.fn(),
    isSending: false,
    sendError: null,
    onAdvance: vi.fn(),
    isAdvancing: false,
    advanceError: null,
  };
}

describe('ConversationWizard - historial', () => {
  it('muestra los mensajes de usuario y asistente en orden', () => {
    render(<ConversationWizard {...baseProps()} />);

    const items = screen.getAllByRole('listitem');
    const texts = items.map((li) => li.textContent);
    expect(texts.some((t) => t?.includes(USER_MSG.content))).toBe(true);
    expect(texts.some((t) => t?.includes(ASSISTANT_MSG.content))).toBe(true);
  });

  it('muestra un mensaje de estado vacío si todavía no hay historial', () => {
    render(<ConversationWizard {...baseProps()} messages={[]} />);

    expect(screen.getByText(/todavía no hay mensajes/i)).toBeInTheDocument();
  });

  it('marca la etapa actual con aria-current="step"', () => {
    render(<ConversationWizard {...baseProps()} />);

    const current = screen.getByText('Problema y contexto');
    expect(current.closest('li')).toHaveAttribute('aria-current', 'step');

    const upcoming = screen.getByText('Usuarios y alcance del MVP');
    expect(upcoming.closest('li')).not.toHaveAttribute('aria-current');
  });
});

describe('ConversationWizard - enviar mensaje', () => {
  it('envía el contenido escrito y limpia el input', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ConversationWizard {...baseProps()} onSendMessage={onSendMessage} />);

    const input = screen.getByLabelText('Tu respuesta');
    await user.type(input, 'Los clientes esperan más de 10 minutos por WhatsApp');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSendMessage).toHaveBeenCalledWith('Los clientes esperan más de 10 minutos por WhatsApp');
    expect(input).toHaveValue('');
  });

  it('no envía un mensaje vacío', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ConversationWizard {...baseProps()} onSendMessage={onSendMessage} />);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('deshabilita el input y el botón mientras se está enviando', () => {
    render(<ConversationWizard {...baseProps()} isSending={true} />);

    expect(screen.getByLabelText('Tu respuesta')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  });

  it('muestra el error de envío recibido por props', () => {
    render(<ConversationWizard {...baseProps()} sendError="El asistente de IA no está disponible" />);

    expect(screen.getAllByRole('alert')[0]).toHaveTextContent('El asistente de IA no está disponible');
  });
});

describe('ConversationWizard - preguntas bloqueantes', () => {
  const BLOCKING: BlockingQuestion[] = [
    { id: 'b1', stage: 'PROBLEM_CONTEXT', question: '¿Quién sufre este problema?', createdAt: '2026-01-01T00:00:00.000Z' },
  ];

  it('resalta las preguntas bloqueantes activas', () => {
    render(<ConversationWizard {...baseProps()} blockingQuestions={BLOCKING} />);

    expect(screen.getByRole('alert')).toHaveTextContent('¿Quién sufre este problema?');
  });

  it('deshabilita "Avanzar de etapa" mientras haya bloqueos activos', () => {
    render(<ConversationWizard {...baseProps()} blockingQuestions={BLOCKING} />);

    expect(screen.getByRole('button', { name: 'Avanzar de etapa' })).toBeDisabled();
  });

  it('habilita "Avanzar de etapa" cuando no hay bloqueos y llama a onAdvance al hacer click', async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<ConversationWizard {...baseProps()} onAdvance={onAdvance} />);

    const button = screen.getByRole('button', { name: 'Avanzar de etapa' });
    expect(button).not.toBeDisabled();
    await user.click(button);

    expect(onAdvance).toHaveBeenCalled();
  });

  it('muestra el error de avance recibido por props', () => {
    render(<ConversationWizard {...baseProps()} advanceError="No se puede avanzar de etapa" />);

    expect(screen.getAllByRole('alert').some((el) => el.textContent?.includes('No se puede avanzar de etapa'))).toBe(
      true,
    );
  });
});
