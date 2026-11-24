import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewPage } from '../../src/pages/project/review/ReviewPage';
import { AuthProvider } from '../../src/store/AuthContext';
import { ToastProvider } from '../../src/components/Toast';
import * as reviewService from '../../src/services/reviewService';
import * as documentsService from '../../src/services/documentsService';
import type { ReviewSummary } from '../../src/types/review';

vi.mock('../../src/services/reviewService');
vi.mock('../../src/services/documentsService');

const ALL_COMPLETE: ReviewSummary = {
  stages: {
    definition: { complete: true },
    dataModel: { complete: true },
    apiSpec: { complete: true },
    screens: { complete: true },
    architecture: { complete: true },
    testing: { complete: true },
  },
  keyDecisions: {
    problemSummary: 'Servicio de courier',
    dataModelVersion: 1,
    apiSpecVersion: 1,
    selectedArchitecture: 'modular-monolith',
    screenMapVersion: 1,
    testPlanVersion: 1,
  },
  blockingQuestions: [],
  inconsistencies: [],
  readyToGenerate: true,
};

function renderReviewPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/projects/p1/review']}>
            <Routes>
              <Route path="/projects/:projectId/review" element={<ReviewPage />} />
              <Route path="/projects/:projectId/documents" element={<p>documentos-stub</p>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem(
    'ideator.auth',
    JSON.stringify({ token: 'jwt', user: { id: '1', email: 'a@b.com', fullName: 'Ana' } }),
  );
  vi.mocked(reviewService.getReviewSummary).mockResolvedValue(ALL_COMPLETE);
  vi.mocked(reviewService.postFinalGeneration).mockResolvedValue({ status: 'ready', message: 'ok' });
  vi.mocked(documentsService.generateSpecDocument).mockResolvedValue({} as never);
  vi.mocked(documentsService.generateArchitectureDocument).mockResolvedValue({} as never);
});

/**
 * Bug reportado: "el boton generar documentacion final no funciona".
 * Solo llamaba al chequeo previo de consistencia (que no genera nada) y
 * mostraba un toast: no se generaba ningun documento y no llevaba a
 * ninguna parte.
 */
describe('ReviewPage - boton de generacion final', () => {
  it('genera los dos documentos y lleva a la pantalla de documentos', async () => {
    const user = userEvent.setup();
    renderReviewPage();

    const boton = await screen.findByRole('button', { name: 'Generar documentación final' });
    await user.click(boton);

    await waitFor(() => {
      expect(documentsService.generateSpecDocument).toHaveBeenCalledWith('p1', 'jwt');
      expect(documentsService.generateArchitectureDocument).toHaveBeenCalledWith('p1', 'jwt');
    });

    expect(await screen.findByText('documentos-stub')).toBeInTheDocument();
  });

  it('valida la consistencia antes de generar', async () => {
    const user = userEvent.setup();
    renderReviewPage();

    await user.click(await screen.findByRole('button', { name: 'Generar documentación final' }));

    await waitFor(() => {
      expect(reviewService.postFinalGeneration).toHaveBeenCalledWith('p1', 'jwt');
    });
  });

  it('si el chequeo previo falla, no genera documentos ni navega', async () => {
    const user = userEvent.setup();
    const { ApiError } = await import('../../src/lib/apiClient');
    vi.mocked(reviewService.postFinalGeneration).mockRejectedValue(
      new ApiError('Todavia falta generar el mapa de pantallas antes de la generacion final.', 409),
    );

    renderReviewPage();
    await user.click(await screen.findByRole('button', { name: 'Generar documentación final' }));

    expect(
      await screen.findByText('Todavia falta generar el mapa de pantallas antes de la generacion final.'),
    ).toBeInTheDocument();
    expect(documentsService.generateSpecDocument).not.toHaveBeenCalled();
    expect(screen.queryByText('documentos-stub')).not.toBeInTheDocument();
  });
});
