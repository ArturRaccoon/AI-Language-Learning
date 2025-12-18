// Helper function to translate Firebase error codes to user-friendly messages
export function translateFirebaseError(errorCode) {
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
