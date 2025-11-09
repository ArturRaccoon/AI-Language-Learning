/**
 * FILE: src/pages/Registration.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: User registration page with email/password and Google authentication
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import '../styles/Auth.css';

function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { register, loginWithGoogle, error, currentUser, userProfile } = useAuthentication();
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
    setLocalError('');

    // Validation
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (name.trim().length < 2) {
      setLocalError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      // Navigation handled by useEffect (will redirect to onboarding)
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // Navigation handled by useEffect (will redirect to onboarding)
    } catch (err) {
      console.error('Google signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎓 Create Account</h1>
          <p>Start your language learning adventure</p>
        </div>

        {displayError && (
          <div className="error-message">
            ⚠️ {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

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
              minLength={6}
            />
            <small>Minimum 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? '⏳ Creating account...' : '🚀 Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleSignup}
          className="btn-google"
          disabled={loading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
          />
          Sign up with Google
        </button>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registration;
