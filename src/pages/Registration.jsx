/**
 * FILE: src/pages/Registration.jsx
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: User registration page with email/password and Google authentication
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '../contexts/AuthenticationContext';
import '../styles/Auth.css';

function Registration() {
  const { t } = useTranslation();
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
      setLocalError(t('registration.errors.password_mismatch', 'Passwords do not match'));
      return;
    }

    if (password.length < 6) {
      setLocalError(t('registration.errors.password_length', 'Password must be at least 6 characters'));
      return;
    }

    if (name.trim().length < 2) {
      setLocalError(t('registration.errors.name_length', 'Name must be at least 2 characters'));
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
          <h1>{t('registration.title', '🎓 Create Account')}</h1>
          <p>{t('registration.subtitle', 'Start your language learning adventure')}</p>
        </div>

        {displayError && (
          <div className="error-message">
            ⚠️ {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t('registration.name_label', 'Full Name')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('registration.name_placeholder', 'John Doe')}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('registration.email_label', 'Email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('registration.email_placeholder', 'your@email.com')}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('registration.password_label', 'Password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('registration.password_placeholder', '••••••••')}
              required
              disabled={loading}
              minLength={6}
            />
            <small>{t('registration.password_hint', 'Minimum 6 characters')}</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('registration.confirm_password_label', 'Confirm Password')}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('registration.confirm_password_placeholder', '••••••••')}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading 
              ? t('registration.creating', '⏳ Creating account...') 
              : t('registration.submit', '🚀 Sign Up')}
          </button>
        </form>

        <div className="divider">
          <span>{t('registration.or', 'OR')}</span>
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
          {t('registration.google', 'Sign up with Google')}
        </button>

        <div className="auth-footer">
          <p>
            {t('registration.have_account', 'Already have an account?')}{' '}
            <Link to="/login">{t('registration.log_in', 'Log in')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registration;
