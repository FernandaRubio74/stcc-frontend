import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router (a diferencia de una navegacion de pagina completa) no
// resetea el scroll al cambiar de ruta - el navegador conserva la posicion
// de scroll de la pagina anterior. Bug reportado: al pasar de una etapa a
// la siguiente (ej. "Ir al modelo de datos" desde el wizard, o "Aprobar y
// continuar" de una etapa a la otra) la pagina nueva aparecia scrolleada
// hacia abajo, obligando a subir a mano para ver el titulo/el aviso de
// conflicto. Montado una sola vez en App.tsx, arriba de <Routes>.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
