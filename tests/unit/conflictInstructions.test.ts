import { describe, expect, it } from 'vitest';
import {
  buildCombinedConflictInstruction,
  buildConflictInstruction,
} from '../../src/pages/project/review/conflictInstructions';
import type { Inconsistency } from '../../src/types/review';

// Regla E de la revision transversal: la sugerencia la redacta el motor de
// consistencia del backend y viaja en el hallazgo. El frontend ya no
// duplica una tabla de reglas para re-derivarla (se desincronizaba: habia
// quedado apuntando a `target-users-coverage`, una regla que ya no existe).
const ISSUE: Inconsistency = {
  id: 'entities-coverage:GET /paquetes:Paquete',
  rule: 'entities-coverage',
  stages: ['data-model', 'api-spec'],
  status: 'error',
  message: 'El endpoint GET /paquetes referencia la entidad "Paquete", que ya no existe en el modelo de datos aprobado.',
  evidence: 'GET /paquetes -> resourceEntity: "Paquete"',
  suggestion: 'Agregá la entidad "Paquete" al modelo de datos, o corregí ese endpoint para que apunte a una entidad que si exista.',
};

describe('buildConflictInstruction', () => {
  it('usa el mensaje y la sugerencia que vienen del backend', () => {
    const result = buildConflictInstruction(ISSUE, 'data-model');

    expect(result).toContain(ISSUE.message);
    expect(result).toContain(ISSUE.suggestion as string);
  });

  it('cae en un pedido generico si el hallazgo no trae sugerencia (respuesta vieja)', () => {
    const sinSugerencia: Inconsistency = { rule: 'otra-regla', stages: ['screens'], message: 'Algo raro paso.' };

    const result = buildConflictInstruction(sinSugerencia, 'screens');

    expect(result).toContain('Algo raro paso.');
    expect(result).toContain('screens');
  });
});

describe('buildCombinedConflictInstruction', () => {
  it('con un solo conflicto devuelve lo mismo que buildConflictInstruction', () => {
    expect(buildCombinedConflictInstruction([ISSUE], 'data-model')).toBe(buildConflictInstruction(ISSUE, 'data-model'));
  });

  it('con varios conflictos los numera en una sola instruccion', () => {
    const otro: Inconsistency = {
      id: 'actors-coverage:no-differentiation',
      rule: 'actors-coverage',
      stages: ['definition', 'data-model'],
      status: 'advertencia',
      message: 'La definicion distingue varios tipos de usuario, pero ninguna etapa posterior los diferencia.',
      suggestion: 'Agregá un campo de rol en la entidad de usuario.',
    };

    const result = buildCombinedConflictInstruction([ISSUE, otro], 'data-model');

    expect(result).toContain('Hay 2 conflictos');
    expect(result).toContain('1. ');
    expect(result).toContain('2. ');
    expect(result).toContain('Agregá un campo de rol');
  });

  it('sin conflictos devuelve una instruccion vacia', () => {
    expect(buildCombinedConflictInstruction([], 'data-model')).toBe('');
  });
});
