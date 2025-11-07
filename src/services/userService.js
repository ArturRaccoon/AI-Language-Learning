/**
 * FILE: src/services/userService.js
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: User profile management and onboarding flow
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
 */
export const createUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    // If user already exists, don't overwrite existing data
    if (userSnap.exists()) {
      console.log('User already exists, skipping creation');
      return userSnap.data();
    }

    const profile = {
      email: data.email || '',
      name: data.displayName || data.name || '',
      nativeLanguage: data.nativeLanguage || 'en',
      targetLanguage: data.targetLanguage || 'it',
      interfaceLanguage: data.interfaceLanguage || 'en',
      level: data.level || 'A1',
      onboardingCompleted: data.onboardingCompleted || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authenticationMethods: data.authenticationMethods || ['password']
    };

    await setDoc(userRef, profile);
    console.log('✅ User profile created:', uid);
    return profile;
  } catch (error) {
    console.error('❌ Profile creation error:', error);
    throw new Error(`Unable to create profile: ${error.message}`);
  }
};

/**
 * Complete onboarding and save preferences
 */
export const completeOnboarding = async (uid, preferences) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      nativeLanguage: preferences.nativeLanguage,
      targetLanguage: preferences.targetLanguage,
      interfaceLanguage: preferences.interfaceLanguage,
      level: preferences.level,
      dailyGoals: preferences.dailyGoals || 10,
      onboardingCompleted: true, // CRITICAL: set to true
      updatedAt: serverTimestamp()
    });

    console.log('✅ Onboarding completed for:', uid);
    return true;
  } catch (error) {
    console.error('❌ Onboarding completion error:', error);
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
    console.error('❌ Profile retrieval error:', error);
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
    console.log('✅ Interface language updated:', languageCode);
  } catch (error) {
    console.error('❌ Language update error:', error);
    throw error;
  }
};
