import { createContext, useContext } from 'react';

export const AuthenticationContext = createContext();

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within AuthenticationProvider');
  }
  return context;
};
