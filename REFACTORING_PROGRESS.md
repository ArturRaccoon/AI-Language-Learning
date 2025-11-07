# Refactoring Progress - Language Learning App

## Completed ✅

### Core Files
- ✅ `src/App.jsx` - Routes standardized to English
- ✅ `src/main.jsx` - Entry point with i18n
- ✅ `src/i18n.js` - Changed fallback from 'it' to 'en'

### Contexts
- ✅ `src/contexts/AuthenticationContext.jsx` 
  - Renamed from `AutenticazioneContext.jsx`
  - All functions/variables converted to English
  - `useAutenticazione` → `useAuthentication`
  - `utenteCorrente` → `currentUser`
  - `profiloUtente` → `userProfile`

### Services
- ✅ `src/services/userService.js`
  - Collection renamed: `utenti` → `users`
  - Functions: `creaProfiloUtente` → `createUserProfile`
  - `completaOnboarding` → `completeOnboarding`
  - All field names: `linguaMadre` → `nativeLanguage`, etc.
  
- ✅ `src/services/flashcardService.js`
  - Collection: `flashcards` (kept)
  - All functions translated: `creaFlashcard` → `createFlashcard`
  - SM-2 algorithm documentation in English
  
### Components
- ✅ `src/components/ProtectedRoute.jsx` - English comments & updated context import

## In Progress 🔄

### Critical Files to Update
- `/src/pages/` - All page files need renaming
- `/src/components/` - Component files need translation
- `/src/services/` - Remaining service files

### Route Name Changes Required
```javascript
// Old → New route names
/registrazione → /registration
/studia → /study
/revisione → /review
/statistiche → /statistics
/impostazioni → /settings
```

## Database Schema Changes Required ⚠️

### Firestore Collections
```
Old Collection → New Collection
----------------------------------
utenti → users
flashcards → flashcards (no change)
```

### User Document Fields
```
Old Field → New Field
-----------------------------------
linguaMadre → nativeLanguage
linguaTarget → targetLanguage
linguaInterfaccia → interfaceLanguage
onboardingCompletato → onboardingCompleted
obiettiviGiornalieri → dailyGoals
creatoIl → createdAt
aggiornatoIl → updatedAt
metodiAutenticazione → authenticationMethods
```

### Flashcard Document Fields
```
idUtente → userId
parolaOriginale → originalWord
traduzione → translation
linguaOriginale → originalLanguage
linguaTraduzione → translationLanguage
dataCreazione → createdAt
livelloConoscenza → knowledgeLevel
ultimaRevisione → lastReview
prossimaRevisione → nextReview
numeroRevisioni → reviewCount
facilita → easiness
intervallo → interval
```

## Next Steps

1. Update all page files in `/pages/`
2. Update all component files in `/components/`
3. Update remaining service files
4. Update Firebase configuration
5. Run data migration script for existing users
6. Update translation files in `/public/locales/`

## Breaking Changes

⚠️ **IMPORTANT**: This refactoring includes breaking changes that require:
- Database migration for existing users
- Updated imports throughout the application
- Route changes that affect bookmarks/links

## Testing Required

- [ ] Authentication flow
- [ ] Onboarding flow
- [ ] Flashcard CRUD operations
- [ ] Review/study sessions
- [ ] Language switching
- [ ] All protected routes
