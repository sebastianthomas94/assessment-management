import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Authentication from './pages/Authentication';
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import LaunchPad from './pages/LaunchPad';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

/** Redirect authed users away from /auth, unauthed users get the auth page. */
function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">
          progress_activity
        </span>
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : <Authentication />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/builder" element={<Builder />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/launch-pad" element={<LaunchPad />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
