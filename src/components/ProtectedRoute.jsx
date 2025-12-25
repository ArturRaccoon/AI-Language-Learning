/**
 * FILE: src/components/ProtectedRoute.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Protected routes with:
 *   - Authentication verification
 *   - Onboarding redirect if necessary
 *   - Option to skip onboarding check for the onboarding route itself
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthContextDefinition';

function ProtectedRoute({ children, requireOnboarding = true }) {
  const { currentUser, userProfile, loading } = useAuthentication();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}></div>
          Loading...
        </div>
      </div>
    );
  }

  // 1. User not logged in: redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. For onboarding route (requireOnboarding = false)
  if (!requireOnboarding) {
    // If already completed onboarding, redirect to home
    if (userProfile?.onboardingCompleted) {
      console.log(' Onboarding already completed, redirecting to home');
      return <Navigate to="/home" replace />;
    }
    // Otherwise, show the onboarding page
    return children;
  }

  // 3. For regular protected routes (requireOnboarding = true)
  // If onboarding not completed, redirect to onboarding
  if (!userProfile?.onboardingCompleted) {
    console.log(' Redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // 4. All good: show content
  return children;
}

export default ProtectedRoute;
