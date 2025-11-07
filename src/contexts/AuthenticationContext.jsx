/**
 * FILE: src/contexts/AuthenticationContext.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Global authentication context managing user auth state and Firebase integration
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { 
  createUserProfile, 
  getUserProfile 
} from '../services/userService';

const AuthenticationContext = createContext();

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within AuthenticationProvider');
  }
  return context;
};

export const AuthenticationProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration with email/password
  const register = async (email, password, name) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, { displayName: name });

      // Create base profile (onboarding NOT completed)
      await createUserProfile(user.uid, {
        email,
        name,
        displayName: name,
        onboardingCompleted: false,
        authenticationMethods: ['password']
      });

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(translateFirebaseError(error.code));
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists
      let profile = await getUserProfile(user.uid);

      if (!profile) {
        // First Google login: create base profile
        await createUserProfile(user.uid, {
          email: user.email,
          name: user.displayName,
          displayName: user.displayName,
          onboardingCompleted: false, // Must complete onboarding
          authenticationMethods: ['google']
        });
      }

      return user;
    } catch (error) {
      console.error('Google login error:', error);
      setError(translateFirebaseError(error.code));
      throw error;
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(translateFirebaseError(error.code));
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Load user profile from Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Profile loading error:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile, // Allows update after onboarding
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};

// Firebase error translation
function translateFirebaseError(errorCode) {
  const errors = {
    'auth/email-already-in-use': 'Email already registered',
    'auth/invalid-email': 'Invalid email',
    'auth/weak-password': 'Password too weak (minimum 6 characters)',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Incorrect password',
    'auth/popup-closed-by-user': 'Popup closed by user',
    'auth/cancelled-popup-request': 'Popup request cancelled',
    'auth/account-exists-with-different-credential': 'Account exists with different method'
  };

  return errors[errorCode] || 'Unknown error';
}
