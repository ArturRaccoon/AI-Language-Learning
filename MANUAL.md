// File: MANUAL.md
// Created: 2025-11-13
// Last-Updated: 2025-11-16
// Author: Claude
// Description: Technical documentation and source of truth for project conventions

# LingoCoon - Technical Manual

## Project Overview
A modern language learning application built with React, Firebase, and i18next.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Internationalization**: i18next
- **Styling**: CSS (Duolingo-inspired)

## Architecture Patterns

### Authentication Flow
1. **Public Landing** (`/`) → User sees language selector and CTA
2. **Public Onboarding** (`/onboarding`) → Collects preferences (language, goals, level) WITHOUT authentication
3. **Registration** (`/registration`) → Creates Firebase Auth user + merges onboarding preferences
4. **Protected Routes** → Require auth + `onboardingCompleted: true`

**📖 For complete onboarding flow documentation, see:** `ONBOARDING_FLOW.md`

### Onboarding Preferences Storage
- Preferences collected in `/onboarding` are stored in **sessionStorage** as JSON
- Key: `onboardingPreferences`
- Retrieved during registration/Google login to create complete user profile in one operation

## File Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `PublicLanding.jsx` |
| Services | camelCase | `userService.js` |
| Contexts | PascalCase + Context suffix | `AuthenticationContext.jsx` |
| Styles | Component name | `PublicLanding.css` |
| Directories | lowercase | `pages/`, `services/` |

## File Header Standard
Every code file must include:
```javascript
// File: relative/path/to/file.ext
// Created: YYYY-MM-DD
// Last-Updated: YYYY-MM-DD
// Author: Claude
// Description: One-line purpose
```

## Firebase Integration

### User Profile Structure (Firestore `users` collection)
```javascript
{
  uid: "firebase_uid",
  email: "user@example.com",
  name: "Full Name",
  displayName: "Display Name",
  nativeLanguage: "en",
  targetLanguage: "it",
  interfaceLanguage: "en",
  level: "A1",
  dailyGoals: 10,
  onboardingCompleted: true, // CRITICAL: gates access to protected routes
  authenticationMethods: ["password"] | ["google"] | ["password", "google"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Authentication Methods
1. **Email/Password Registration**:
   - Creates Firebase Auth user
   - Retrieves `sessionStorage` preferences
   - Merges preferences with base data
   - Creates Firestore profile with `onboardingCompleted: true`
   - Clears sessionStorage

2. **Google Login**:
   - First-time: Same flow as email/password
   - Returning user: Loads existing profile

## Available Languages

### Study Languages
- Italian (it)
- French (fr)
- Ukrainian (uk)
- English (en)

### Interface Languages
- Italian (it)
- French (fr)
- Ukrainian (uk)
- English (en)
- (+ 23 more in PublicLanding selector)

## Routing Structure

### Public Routes
- `/` - PublicLanding
- `/login` - Login
- `/registration` - Registration
- `/onboarding` - Public onboarding (NO AUTH REQUIRED)

### Protected Routes (require auth + onboarding)
- `/home` - Dashboard
- `/study` - Study session
- `/flashcards` - Flashcard review
- `/review` - Spaced repetition
- `/statistics` - Progress tracking
- `/settings` - User settings
- `/chat` - AI conversation practice

## Key Services

### userService.js
- `createUserProfile(uid, data)` - Creates/updates user profile
- `getUserProfile(uid)` - Fetches user profile
- `completeOnboarding(uid, preferences)` - **DEPRECATED** (merged into registration flow)
- `updateInterfaceLanguage(uid, langCode)` - Updates UI language

### AuthenticationContext.jsx
- `register(email, password, name)` - Email/password registration with preference merge
- `loginWithGoogle()` - Google OAuth with preference merge
- `login(email, password)` - Standard login
- `logout()` - Sign out
- **Helper**: `createProfileWithPreferences(uid, baseData)` - Handles sessionStorage merge

## Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Common Commands
```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Design System
- **Primary Color**: #58CC02 (Duolingo green)
- **Danger Color**: #FF4B4B
- **Text**: #4B4B4B
- **Background**: #FFFFFF
- **Cards**: Box-shadow based elevation

## Testing Strategy
- Unit tests: Services and utilities
- Integration tests: Authentication flow
- E2E tests: Critical user journeys

## Deployment Checklist
- [ ] Firebase config validated
- [ ] Environment variables set
- [ ] Build passes without warnings
- [ ] Authentication flow tested
- [ ] Protected routes verified
- [ ] i18n translations complete

## Known Issues & Solutions

### Issue: "No document to update" during onboarding
**Cause**: Race condition between `createUserProfile` and `completeOnboarding`
**Solution**: Merge preferences during registration using sessionStorage + helper function

### Issue: User redirected to onboarding after completing it
**Cause**: `onboardingCompleted` not set to `true` in profile
**Solution**: Ensure `createProfileWithPreferences` sets flag correctly

### Issue: Infinite onboarding loop - users with existing accounts trapped in onboarding
**Cause**: `/onboarding` page had no "Already have an account?" link to navigate back to `/login`
**Solution**: Added Link component at bottom of onboarding page pointing to `/login` (Fixed 2025-11-16)
**Location**: `src/pages/Onboarding.jsx` - auth-footer div with Link to `/login`

### Issue: Users with existing profiles always redirected to onboarding after login
**Cause**: `onboardingCompleted` was set to `false` by default for existing users
**Solution**: Modified `createUserProfile` in `userService.js` to:
  1. Auto-fix existing profiles with `onboardingCompleted: false` → set to `true` on login
  2. Only set `onboardingCompleted: true` for NEW profiles when explicitly passed (via sessionStorage)
**Location**: `src/services/userService.js` - createUserProfile function (Fixed 2025-11-16)

## Future Enhancements
- [ ] Email verification
- [ ] Password reset flow
- [ ] Social auth (Facebook, Apple)
- [ ] Profile picture upload
- [ ] Friend system
- [ ] Leaderboards

---
**Last Updated**: 2025-11-16
**Maintained By**: Claude (Senior Developer)
