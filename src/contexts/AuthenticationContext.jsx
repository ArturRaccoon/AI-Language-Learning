/**
 * FILE: src/contexts/AuthenticationContext.jsx
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: Global auth context with auto-fix for onboarding loop
 *   FIX: createUserProfile called in onAuthStateChanged to auto-fix existing profiles
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
import { AuthenticationContext } from './AuthCtx';
import { 
  createUserProfile, 
  getUserProfile 
} from '../services/userService';

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

  // Helper function to create profile with onboarding preferences
  const createProfileWithPreferences = async (uid, baseData) => {
    const prefsJSON = sessionStorage.getItem('onboardingPreferences');
    let finalProfileData = {
      ...baseData,
      onboardingCompleted: false
    };

    if (prefsJSON) {
      try {
        console.log(' Onboarding preferences found! Creating full profile.');
        const prefs = JSON.parse(prefsJSON);
        
        finalProfileData = {
          ...baseData,
          nativeLanguage: prefs.nativeLanguage || 'en',
          targetLanguage: prefs.targetLanguage || 'it',
          interfaceLanguage: prefs.interfaceLanguage || 'en',
          level: prefs.level || 'A1',
          dailyGoals: prefs.dailyGoals || 10,
          goals: prefs.goals || [],
          onboardingCompleted: true
        };
        
        sessionStorage.removeItem('onboardingPreferences');

      } catch (e) {
        console.error("Error parsing sessionStorage preferences:", e);
      }
    } else {
      console.log(' No preferences in sessionStorage, creating base profile.');
    }

    await createUserProfile(uid, finalProfileData);
    return finalProfileData;
  };

  // Registration with email/password
  const register = async (email, password, name) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(user, { displayName: name });

      const newProfile = await createProfileWithPreferences(user.uid, {
        email,
        name,
        displayName: name,
        authenticationMethods: ['password']
      });
      setUserProfile(newProfile);

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

      const existingProfile = await getUserProfile(user.uid);

      if (!existingProfile) {
        const newProfile = await createProfileWithPreferences(user.uid, {
          email: user.email,
          name: user.displayName,
          displayName: user.displayName,
          authenticationMethods: ['google']
        });
        setUserProfile(newProfile);
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
      console.log(' Login attempt for:', email);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log(' Firebase Auth successful');
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
      console.log(' onAuthStateChanged triggered:', user ? user.email : 'no user');
      setCurrentUser(user);

      if (user) {
        try {
          console.log(' Loading profile for:', user.uid);
          const profile = await createUserProfile(user.uid, { email: user.email });
          console.log(' Profile loaded:', {
            email: profile.email,
            onboardingCompleted: profile.onboardingCompleted,
            targetLanguage: profile.targetLanguage
          });
          setUserProfile(profile);
        } catch (error) {
          console.error(' Profile loading error:', error);
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
    setUserProfile,
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

export default AuthenticationContext;
