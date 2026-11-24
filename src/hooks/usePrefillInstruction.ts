import { useLocation } from 'react-router-dom';

/**
 * Lee la instruccion de resolucion de conflicto que Revision final manda
 * como navigation state al navegar con "Ir a X a resolverlo" (ver
 * review/conflictInstructions.ts) - undefined si se llego a la pagina de
 * cualquier otra forma.
 */
export function usePrefillInstruction(): string | undefined {
  const location = useLocation();
  const state = location.state as { prefillInstruction?: string } | null;
  return state?.prefillInstruction;
}
