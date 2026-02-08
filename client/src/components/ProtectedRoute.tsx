import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingFallback } from './LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Handles authentication-based route protection
 * 
 * @param children - Components to render if authorized
 * @param requireAuth - If true, requires user to be logged in (default: true)
 * @param redirectTo - Where to redirect if not authorized (default: /auth?mode=login)
 */
export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth?mode=login'
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return <LoadingFallback message="Checking authentication..." fullScreen />;
  }

  // If route requires auth and user is not logged in
  if (requireAuth && !user) {
    // Save the location they were trying to access
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route requires NO auth (like login page) and user IS logged in
  if (!requireAuth && user) {
    // Redirect to dashboard or home
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // User is authorized, render children
  return <>{children}</>;
};

/**
 * Public Route Component
 * For routes that should only be accessible when NOT logged in (login, signup)
 */
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
      {children}
    </ProtectedRoute>
  );
};
