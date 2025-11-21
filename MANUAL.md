// File: manual.md
// Created: 2025-11-13
// Last-Updated: 2025-11-17
// Maintainer: Core Engineering
// Description: Authoritative guide for structure, setup, contribution, and roadmap

# LingoCoon Project Manual (Version 1.0 Baseline)

This document captures the frozen state of Version 1.0. Every future enhancement must keep this baseline stable unless explicitly approved.

---

## 1. Project Structure

```
project/
├── manual.md                # This document
├── package.json             # Runtime scripts and dependencies
├── src/
│   ├── main.jsx             # App entry point (imports i18n)
│   ├── i18n.js              # i18next configuration
│   ├── App.jsx              # Router and providers
│   ├── contexts/            # React context providers (auth only for now)
│   ├── pages/               # Route-level pages
│   ├── components/          # Reusable UI blocks
│   ├── services/            # Firebase and AI integration helpers
│   ├── hooks/               # Custom hooks (audio, stats, etc.)
│   ├── config/              # Firebase configuration
│   ├── styles/              # Global and page-specific CSS
│   └── utils/               # Utility helpers (prompt builder, etc.)
├── public/
│   ├── index.html           # Vite HTML shell
│   └── locales/             # Static translation bundles (en, it, fr, uk)
├── ONBOARDING_FLOW.md       # Deep dive on onboarding logic
├── COMPLETE_FILES_SUMMARY.md# Full inventory (for auditors)
├── COMPLETE_FLOW_SUMMARY.md # High-level business flows
└── ...
```

**Naming rules**

- React components and contexts: `PascalCase`.
- Hooks and services: `camelCase`.
- Stylesheets: match the component or page name.
- Directories: snake case is forbidden; use lower-case words separated by dashes only when necessary.

---

## 2. Environment Setup

### Prerequisites
- Node.js 20.x (LTS) and npm 10+
- Firebase project with Firestore and Authentication enabled
- Optional: Chrome or Edge for debugging, VS Code with ESLint plugin

### Installation
```bash
npm install
```

### Environment variables
Create `.env.local` with the Firebase keys (see `.env.example` snippet below). Never commit environment files.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 3. Running and Building

| Purpose             | Command          | Notes                                      |
|---------------------|------------------|--------------------------------------------|
| Local development   | `npm run dev`    | Runs Vite dev server on port 5173          |
| Type checking/lint  | `npm run lint`   | ESLint flat config                         |
| Production build    | `npm run build`  | Emits artifacts in `dist/` (not committed) |
| Preview build       | `npm run preview`| Serves production build locally            |

Always run `npm run lint` before opening a pull request. The build must remain warning-free.

---

## 4. Application Architecture

### Authentication and onboarding
1. `/` (PublicLanding) collects no data; it only links to onboarding or login.
2. `/onboarding` stores preferences in `sessionStorage` under `onboardingPreferences`.
3. `/registration` or Google login reads that payload through `createProfileWithPreferences` and persists the profile with `onboardingCompleted: true`.
4. Existing users automatically have `onboardingCompleted` enforced by `createUserProfile` to avoid loops.
5. `ProtectedRoute` allows access only if Firebase Auth is satisfied and the profile flag is true.

### Internationalization
- `src/i18n.js` configures i18next with the HTTP backend and browser detection.
- Static JSON bundles live in `public/locales/<lng>/translation.json`.
- Every UI string must go through `useTranslation`. No inline literals in JSX except technical labels.

### Services
- `userService.js`: profile lifecycle (create, complete onboarding, update interface language).
- `flashcardService.js`: CRUD plus SM-2 spaced repetition.
- `chatService.js`, `ttsService.js`, `translationService.js`: remote API integration points (all HTTP-based, promise-returning functions).

### State handling
- Authentication context exposes `currentUser`, `userProfile`, status flags, and auth actions.
- Page components remain lean by delegating data-access concerns to services and contexts.

---

## 5. Contribution Workflow

1. **Create a feature branch** from `main` using `feature/<short-description>`.
2. **Install dependencies** and ensure a clean `git status`.
3. **Implement changes** while keeping components pure and deterministic.
4. **Run quality gates**  
   - `npm run lint`  
   - `npm run build`
5. **Add or update tests** in `src/components/tests/` when modifying auth, routing, or services.
6. **Update documentation** (manual, onboarding guide, or summaries) whenever structure or flows change.
7. **Open a pull request** with:
   - Summary
   - Screenshots (UI work)
   - Testing evidence
8. **Code review** is mandatory. Address feedback before merging.

---

## 6. Coding Guidelines

- Avoid emojis, decorative glyphs, or playful copy in both source code and UI.
- Keep logging serious and informative. Use structured data where possible.
- Files should start with the four-line header comment (File, Created, Last-Updated, Description).
- Components must remain stateless where possible; prefer hooks/services for side effects.
- Use absolute imports only when aliasing is configured; otherwise stick to relative paths.

---

## 7. Known Limitations (Version 1.0)

| Area              | Limitation                                                                      |
|-------------------|----------------------------------------------------------------------------------|
| Analytics         | No telemetry or error tracking beyond console logs.                             |
| Testing           | Limited automated coverage (only auth and routing smoke tests).                 |
| Accessibility     | Some placeholder pages need full keyboard navigation and ARIA review.          |
| Offline support   | Service workers are not configured; the app requires a network connection.      |
| Payments          | No monetization or subscription handling is implemented.                        |
| Mobile polish     | Layout adapts but lacks device-specific optimizations or gestures.              |

Do not ship beyond MVP scope until each limitation has a mitigation plan.

---

## 8. Future Roadmap

1. **Trust and safety**
   - Email verification and password reset
   - Session expiration handling with refresh tokens
2. **Learning depth**
   - Rich statistics dashboards with Firestore aggregations
   - Voice input assessment via Web Speech API
3. **Collaboration**
   - Shared study groups and leaderboard hooks
4. **Content management**
   - Import/export flashcards (CSV or Anki)
   - Template-based flashcard generation
5. **Infrastructure**
   - Automated deployment pipeline (Vercel + Firebase rules check)
   - Synthetic monitoring for uptime and latency

Each roadmap item must include clear acceptance criteria before development begins.

---

## 9. Support Contacts

- **Engineering owner**: Core Engineering (engineering@project.example)
- **Product owner**: Language Learning Lead (product@project.example)
- **Security**: Report incidents to security@project.example within 24 hours.

---

Version 1.0 is now considered stable. Treat this manual as the single source of truth when onboarding new contributors or auditing the repository.
