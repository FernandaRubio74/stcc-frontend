import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SsoCallbackPage } from './pages/auth/SsoCallbackPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { NewProjectPage } from './pages/dashboard/NewProjectPage';
import { ProjectDetailPage } from './pages/project/ProjectDetailPage';
import { WizardPage } from './pages/project/wizard/WizardPage';
import { DataModelPage } from './pages/project/data-model/DataModelPage';
import { ApiSpecPage } from './pages/project/api-spec/ApiSpecPage';
import { ScreensPage } from './pages/project/screens/ScreensPage';
import { ArchitecturePage } from './pages/project/architecture/ArchitecturePage';
import { ReviewPage } from './pages/project/review/ReviewPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/sso/callback" element={<SsoCallbackPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <NewProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/wizard"
        element={
          <ProtectedRoute>
            <WizardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/data-model"
        element={
          <ProtectedRoute>
            <DataModelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/api-spec"
        element={
          <ProtectedRoute>
            <ApiSpecPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/screens"
        element={
          <ProtectedRoute>
            <ScreensPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/architecture"
        element={
          <ProtectedRoute>
            <ArchitecturePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/review"
        element={
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
