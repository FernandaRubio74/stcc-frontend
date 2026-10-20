import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Placeholder: el listado de proyectos y gestion de miembros es STCC-64,
// pendiente hasta que exista el backend de proyectos. Esta pantalla solo
// sirve como destino post-login para STCC-59.
export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-900">Bienvenido, {user?.fullName}</h1>
        <p className="text-sm text-gray-600">{user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
