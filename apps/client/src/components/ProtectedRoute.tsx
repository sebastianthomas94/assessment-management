import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards protected routes.
 * - While the session is hydrating, render a minimal loading state.
 * - If there is no authenticated user, redirect to /auth.
 * - Otherwise render the matched child route via <Outlet />.
 */
export default function ProtectedRoute() {
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
