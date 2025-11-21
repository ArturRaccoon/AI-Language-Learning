/**
 * FILE: src/services/userService.js
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: User profile management and onboarding flow
 *   FIX: Existing profiles are treated as onboarding completed
 */

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Supported languages for STUDY
export const AVAILABLE_LANGUAGES = [
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'en', name: 'English', native: 'English' }
];

// Supported languages for INTERFACE
export const INTERFACE_LANGUAGES = [
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'en', name: 'English', native: 'English' }
];

/**
 * Create or update user profile after registration/login
 * FIX: If user already exists, ensure onboardingCompleted is true
 */
export const createUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    // If user already exists, ensure onboarding is marked complete
    if (userSnap.exists()) {
      console.log('User already exists, checking onboarding status');
      const existingData = userSnap.data();
      
      // If onboardingCompleted is false but profile exists, fix it
      if (!existingData.onboardingCompleted) {
        console.log(' Fixing onboardingCompleted flag for existing user');
        await updateDoc(userRef, {
          onboardingCompleted: true,
          updatedAt: serverTimestamp()
        });
        return { ...existingData, onboardingCompleted: true };
      }
      
      return existingData;
    }

    // CRITICAL: onboardingCompleted should ONLY be true if explicitly passed as true
    // This ensures new registrations without onboarding preferences get redirected
    const profile = {
      email: data.email || '',
      name: data.displayName || data.name || '',
      nativeLanguage: data.nativeLanguage || 'en',
      targetLanguage: data.targetLanguage || 'it',
      interfaceLanguage: data.interfaceLanguage || 'en',
      level: data.level || 'A1',
      goals: data.goals || [],
      onboardingCompleted: data.onboardingCompleted === true, // Only true if explicitly set
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authenticationMethods: data.authenticationMethods || ['password']
    };

    await setDoc(userRef, profile);
    console.log(' User profile created:', uid);
    return profile;
  } catch (error) {
    console.error(' Profile creation error:', error);
    throw new Error(`Unable to create profile: ${error.message}`);
  }
};

/**
 * Complete onboarding and save preferences
 * Uses setDoc with merge to avoid race condition with createUserProfile
 */
export const completeOnboarding = async (uid, preferences) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Use setDoc with merge: true to create OR update the document
    // This prevents "No document to update" errors from race conditions
    await setDoc(userRef, {
      nativeLanguage: preferences.nativeLanguage,
      targetLanguage: preferences.targetLanguage,
      interfaceLanguage: preferences.interfaceLanguage,
      level: preferences.level,
      dailyGoals: preferences.dailyGoals || 10,
      goals: preferences.goals || [],
      onboardingCompleted: true, // CRITICAL: set to true
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(' Onboarding completed for:', uid);
    return true;
  } catch (error) {
    console.error(' Onboarding completion error:', error);
    throw error;
  }
};

/**
 * Retrieve user profile
 */
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return {
      uid,
      ...userSnap.data()
    };
  } catch (error) {
    console.error(' Profile retrieval error:', error);
    throw error;
  }
};

/**
 * Update interface language
 */
export const updateInterfaceLanguage = async (uid, languageCode) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      interfaceLanguage: languageCode,
      updatedAt: serverTimestamp()
    });
    console.log(' Interface language updated:', languageCode);
  } catch (error) {
    console.error(' Language update error:', error);
    throw error;
  }
};
