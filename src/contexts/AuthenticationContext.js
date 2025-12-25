/**
 * FILE: src/contexts/AuthenticationContext.js
 * LAST MODIFIED: 25 Dicembre 2025 - 16:15 (CET)
 * DESCRIPTION: Context definition and Hook
 */

import { createContext, useContext } from 'react';

export const AuthenticationContext = createContext();

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within AuthenticationProvider');
  }
  return context;
};
