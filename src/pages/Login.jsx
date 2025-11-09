/**
 * FILE: src/pages/Login.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: User login page with email/password and Google authentication
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, error, currentUser, userProfile } = useAuthentication();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && userProfile) {
      if (userProfile.onboardingCompleted) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [currentUser, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // Navigation handled by useEffect
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🌍 Welcome Back</h1>
          <p>Log in to continue your language learning journey</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🚀 Log In'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn-google"
          disabled={loading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
          />
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/registration">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
