import type { Inconsistency } from '../../../types/review';

// Pedido explicito: al clickear "Resolver" desde un conflicto, la etapa
// destino tiene que abrir con el chat YA CARGADO con una instruccion
// concreta para resolverlo - no alcanza con mostrar el mensaje otra vez,
// tiene que quedar listo para mandarselo a la IA con un click.
//
// Revision transversal (regla E): la sugerencia la redacta AHORA el motor
// de consistencia del backend y viaja en cada hallazgo (`suggestion`), con
// la evidencia que lo disparo. Antes el frontend la volvia a derivar por su
// cuenta parseando el mensaje del hallazgo, con una tabla de reglas
// duplicada: se desincronizaba en cuanto cambiaba una regla (de hecho
// quedo apuntando a `target-users-coverage`, una regla que ya no existe) y
// podia sugerir algo distinto de lo que el backend consideraba la
// resolucion. Ahora hay una sola fuente de verdad.

/** @param targetRuleStage id de etapa del motor ("definition" | "data-model" | "api-spec" | "screens") a la que se esta navegando. */
export function buildConflictInstruction(issue: Inconsistency, targetRuleStage: string): string {
  if (issue.suggestion) {
    return `${issue.message}\n\n${issue.suggestion}`;
  }
  // Fallback para un hallazgo sin sugerencia (respuesta vieja del backend).
  return `Resolvé este conflicto entre etapas, en la etapa "${targetRuleStage}": ${issue.message}`;
}

// Boton unico "Resolver" por etapa (en vez de un link por conflicto
// individual): cuando una etapa tiene mas de un conflicto, hay que
// combinarlos en una sola instruccion prolija en vez de solo concatenar
// mensajes sueltos, para que el chat reciba un pedido que se lea como una
// sola instruccion bien armada.
export function buildCombinedConflictInstruction(issues: Inconsistency[], targetRuleStage: string): string {
  if (issues.length === 0) return '';
  if (issues.length === 1) return buildConflictInstruction(issues[0], targetRuleStage);

  const items = issues.map((issue) => buildConflictInstruction(issue, targetRuleStage));
  return `Hay ${items.length} conflictos para resolver acá:\n${items.map((item, i) => `${i + 1}. ${item}`).join('\n\n')}`;
}
