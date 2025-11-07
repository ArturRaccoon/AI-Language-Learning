/**
 * FILE: src/components/ProtectedRoute.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Protected routes with:
 *   - Authentication verification
 *   - Onboarding redirect if necessary
 *   - Exception for `/onboarding` route itself
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';

function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuthentication();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // 1. User not logged in → redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. User logged in but onboarding not completed
  if (!userProfile?.onboardingCompleted) {
    // Exception: if already on onboarding route, don't redirect
    if (location.pathname === '/onboarding') {
      return children;
    }

    // Otherwise redirect to onboarding
    console.log('🔄 Redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // 3. User logged in with completed onboarding
  // But if trying to access /onboarding → redirect to home
  if (location.pathname === '/onboarding') {
    console.log('✅ Onboarding already completed, redirecting to home');
    return <Navigate to="/home" replace />;
  }

  // 4. All good → show content
  return children;
}

export default ProtectedRoute;
