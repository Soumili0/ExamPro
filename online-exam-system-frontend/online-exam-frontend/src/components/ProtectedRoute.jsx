import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Role-based route guard.
 *
 * Usage in AppRoutes:
 *   <Route element={<ProtectedRoute />}>           — any authenticated user
 *   <Route element={<ProtectedRoute roles={['student']} />}>  — student only
 *   <Route element={<ProtectedRoute roles={['admin','teacher']} />}> — admin or teacher
 */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — if roles prop given, user's role must be in the list
  if (roles && roles.length > 0) {
    const userRole = (user.role || '').toLowerCase();
    const allowed  = roles.map(r => r.toLowerCase());
    if (!allowed.includes(userRole)) {
      // Redirect to correct dashboard instead of a blank page
      const redirect =
        userRole === 'admin'    ? '/admin/dashboard'    :
        userRole === 'teacher'  ? '/teacher/dashboard'  :
                                  '/user/dashboard';
      return <Navigate to={redirect} replace />;
    }
  }

  return <Outlet />;
}
