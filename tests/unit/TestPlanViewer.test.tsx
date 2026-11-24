import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestPlanViewer } from '../../src/pages/project/testing/TestPlanViewer';
import type { TestPlanContent } from '../../src/types/testing';

const CONTENT: TestPlanContent = {
  strategy: {
    inScope: ['Publicar canchas'],
    outOfScope: ['Pruebas de carga'],
    riskPriorities: [{ item: 'Publicar canchas', risk: 'alto', rationale: 'es el core del MVP' }],
  },
  acceptanceCases: [
    { id: 'AC-1', ruleRef: 'Publicar canchas', given: 'un dueño autenticado', when: 'publica una cancha', then: 'queda visible en el listado' },
  ],
  endpointCases: [
    { endpointRef: 'GET /canchas', happyPath: 'devuelve 200', invalidData: 'rechaza filtros invalidos', unauthorized: 'devuelve 401' },
  ],
  screenCases: [{ screenRef: 'Listado de canchas', loading: 'muestra spinner', empty: 'muestra estado vacio', error: 'muestra error' }],
  e2eFlows: [{ name: 'Publicar y reservar', steps: ['Publica la cancha', 'El jugador reserva'], relatedCaseIds: ['AC-1'] }],
  securityCases: [{ id: 'SEC-1', description: 'un jugador no puede publicar canchas', type: 'permisos' }],
  negativeCases: [{ id: 'NEG-1', description: 'reservar un horario ya tomado', expectedRejection: '409' }],
  usabilityCases: [{ id: 'UX-1', description: 'el foco de teclado es visible' }],
  testData: [{ entity: 'Cancha', environment: 'desarrollo', description: '5 a 10 canchas' }],
  traceabilityMatrix: [{ requirementRef: 'Publicar canchas', caseIds: ['AC-1'] }],
};

describe('TestPlanViewer', () => {
  it('muestra la estrategia con los riesgos priorizados', () => {
    render(<TestPlanViewer content={CONTENT} />);

    expect(screen.getByText('Estrategia')).toBeInTheDocument();
    expect(screen.getAllByText('Publicar canchas').length).toBeGreaterThan(0);
    expect(screen.getByText('alto')).toBeInTheDocument();
  });

  it('muestra los casos de aceptacion con su id y regla', () => {
    render(<TestPlanViewer content={CONTENT} />);

    // "AC-1" aparece tanto en el caso de aceptacion como en la matriz de
    // trazabilidad - por eso se verifica con "getAllBy", no "getBy".
    expect(screen.getAllByText('AC-1').length).toBeGreaterThan(0);
    expect(screen.getByText(/un dueño autenticado/)).toBeInTheDocument();
  });

  it('muestra los casos por endpoint y por pantalla', () => {
    render(<TestPlanViewer content={CONTENT} />);

    expect(screen.getByText('GET /canchas')).toBeInTheDocument();
    expect(screen.getByText('Listado de canchas')).toBeInTheDocument();
  });

  it('muestra la matriz de trazabilidad', () => {
    render(<TestPlanViewer content={CONTENT} />);

    expect(screen.getByText('Matriz de trazabilidad')).toBeInTheDocument();
    expect(screen.getAllByText('Publicar canchas').length).toBeGreaterThan(0);
  });

  it('muestra un mensaje de vacio cuando una seccion no tiene datos', () => {
    render(<TestPlanViewer content={{ ...CONTENT, usabilityCases: [] }} />);

    expect(screen.getByText('Todavía no hay casos de usabilidad.')).toBeInTheDocument();
  });
});
