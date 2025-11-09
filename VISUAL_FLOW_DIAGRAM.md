# 🎨 Visual Flow Diagram - Public Onboarding

## Complete User Journey

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  PUBLIC LANDING PAGE                 ┃
┃                    http://localhost:5173/            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           │
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┏━━━━━━━━━━━━━━━━┓              ┏━━━━━━━━━━━━━━━━━┓
┃  "INIZIA ORA"  ┃              ┃ "HO GIÀ ACCOUNT"┃
┃  (Get Started) ┃              ┃   (I have acc)  ┃
┗━━━━━━━┬━━━━━━━┛              ┗━━━━━━━┬━━━━━━━━━┛
        │                                │
        │                                │
        ▼                                ▼
┏━━━━━━━━━━━━━━━━┓              ┏━━━━━━━━━━━━━━━━━┓
┃  REGISTRATION  ┃              ┃      LOGIN      ┃
┃   /registration┃              ┃      /login     ┃
┃                ┃              ┃                 ┃
┃  • Name        ┃              ┃  • Email        ┃
┃  • Email       ┃              ┃  • Password     ┃
┃  • Password    ┃              ┃  • Submit       ┃
┃  • Confirm     ┃              ┃                 ┃
┃  • Google SSO  ┃              ┃  • Google SSO   ┃
┗━━━━━━━┬━━━━━━━┛              ┗━━━━━━━┬━━━━━━━━━┛
        │                               
        │ User registers                 │ User logs in
        ▼                                │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━┓
┃          ONBOARDING FLOW              │         ┃
┃           /onboarding                 │         ┃
┃  ┌─────────────────────────────────┐ │         ┃
┃  │ Step 1: Choose Languages        │ │         ┃
┃  │  • Native language              │ │         ┃
┃  │  • Target language to learn     │ │         ┃
┃  └─────────────────────────────────┘ │         ┃
┃                ↓                      │         ┃
┃  ┌─────────────────────────────────┐ │         ┃
┃  │ Step 2: Select Goals            │ │         ┃
┃  │  • Travel                       │ │         ┃
┃  │  • Work                         │ │         ┃
┃  │  • Study                        │ │         ┃
┃  │  • Culture                      │ │         ┃
┃  │  • Conversation                 │ │         ┃
┃  │  • Other                        │ │         ┃
┃  └─────────────────────────────────┘ │         ┃
┃                ↓                      │         ┃
┃  ┌─────────────────────────────────┐ │         ┃
┃  │ Step 3: Choose Level            │ │         ┃
┃  │  • Beginner                     │ │         ┃
┃  │  • Elementary                   │ │         ┃
┃  │  • Intermediate                 │ │         ┃
┃  │  • Advanced                     │ │         ┃
┃  │  • Native                       │ │         ┃
┃  └─────────────────────────────────┘ │         ┃
┗━━━━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━┷━━━━━━━━━┛
                  │                      │
                  │ onboarding complete  │ already onboarded
                  │                      │
                  └──────────┬───────────┘
                             ▼
                  ┏━━━━━━━━━━━━━━━━━━━━┓
                  ┃    HOME DASHBOARD   ┃
                  ┃        /home        ┃
                  ┃                     ┃
                  ┃  • Study Session    ┃
                  ┃  • Flashcards       ┃
                  ┃  • Review           ┃
                  ┃  • Statistics       ┃
                  ┃  • Chat (AI)        ┃
                  ┃  • Settings         ┃
                  ┗━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎯 Component Hierarchy

```
App.jsx
 │
 ├─ BrowserRouter
 │   │
 │   ├─ AuthenticationProvider
 │   │   │
 │   │   └─ Routes
 │   │       │
 │   │       ├─ / ───────────────────→ PublicLanding ✨ NEW
 │   │       │                              │
 │   │       │                              ├─ Header
 │   │       │                              │   ├─ Logo
 │   │       │                              │   └─ LanguageSelector
 │   │       │                              │       └─ Dropdown (27 langs)
 │   │       │                              │
 │   │       │                              ├─ MainContent
 │   │       │                              │   ├─ Illustration
 │   │       │                              │   │   └─ AnimatedCharacters
 │   │       │                              │   └─ CTASection
 │   │       │                              │       ├─ Title
 │   │       │                              │       └─ Buttons
 │   │       │                              │
 │   │       │                              └─ CookieBanner (conditional)
 │   │       │
 │   │       ├─ /login ────────────────────→ Login
 │   │       ├─ /registration ─────────────→ Registration
 │   │       ├─ /onboarding ───────────────→ OnboardingFlow
 │   │       ├─ /home ─────────────────────→ Home (protected)
 │   │       ├─ /study ────────────────────→ StudySession (protected)
 │   │       ├─ /flashcards ───────────────→ Flashcards (protected)
 │   │       ├─ /review ───────────────────→ Review (protected)
 │   │       ├─ /statistics ───────────────→ Statistics (protected)
 │   │       ├─ /settings ─────────────────→ Settings (protected)
 │   │       └─ /chat ─────────────────────→ Chat (protected)
```

---

## 🗂️ File Structure (Public Onboarding)

```
project/
│
├─ src/
│   ├─ pages/
│   │   ├─ PublicLanding.jsx ✨ NEW
│   │   ├─ Login.jsx ✓ EXISTS
│   │   ├─ Registration.jsx ✓ EXISTS
│   │   └─ OnboardingFlow.jsx ✓ EXISTS
│   │
│   ├─ styles/
│   │   └─ PublicLanding.css ✨ NEW
│   │
│   ├─ App.jsx 📝 MODIFIED
│   └─ i18n.js ✓ EXISTS
│
├─ public/
│   ├─ logo.svg ✨ NEW
│   │
│   └─ locales/
│       ├─ en/
│       │   └─ translation.json 📝 MODIFIED
│       ├─ it/
│       │   └─ translation.json 📝 MODIFIED
│       ├─ fr/
│       │   └─ translation.json 📝 MODIFIED
│       └─ uk/
│           └─ translation.json 📝 MODIFIED
│
└─ Documentation/
    ├─ PUBLIC_ONBOARDING.md ✨ NEW
    ├─ COMPLETE_FILES_SUMMARY.md ✨ NEW
    └─ SETUP_GUIDE.md ✨ NEW
```

**Legend**:
- ✨ NEW = Newly created file
- 📝 MODIFIED = Existing file modified
- ✓ EXISTS = Existing file (no changes)

---

## 🔄 State Management Flow

```
┌──────────────────────────────────────────────────┐
│         Browser / LocalStorage                   │
│                                                  │
│  • i18nextLng: "it" (selected language)         │
│  • cookieConsent: "accepted" | "rejected"       │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│              i18n Context                        │
│                                                  │
│  • currentLanguage: "it"                        │
│  • changeLanguage(lang)                         │
│  • t(key, default)                              │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│        PublicLanding Component                   │
│                                                  │
│  State:                                         │
│  • showLanguageSelector: boolean                │
│  • showCookieConsent: boolean                   │
│                                                  │
│  Effects:                                        │
│  • Check localStorage for cookieConsent         │
│                                                  │
│  Handlers:                                       │
│  • handleLanguageChange(langCode)               │
│  • handleAcceptCookies()                        │
│  • handleRejectCookies()                        │
└──────────────────────────────────────────────────┘
```

---

## 🎬 Animation Timeline

```
Page Load
│
├─ 0ms ──────────→ Page structure renders
│
├─ 100ms ────────→ Cookie banner slides up (if first visit)
│   │
│   └─ Animation: slideUp (0.3s)
│
├─ 200ms ────────→ Characters start floating
│   │
│   ├─ Character 1: Float (3s loop, delay 0s)
│   ├─ Character 2: Float (3s loop, delay 0.5s)
│   ├─ Character 3: Float (3s loop, delay 1s)
│   ├─ Character 4: Float (3s loop, delay 1.5s)
│   └─ Duo Mascot: Bounce (2s loop)
│
└─ Continuous ───→ Smooth animations loop forever

User Interactions
│
├─ Language Selector Click
│   │
│   ├─ 0ms ──────→ Dropdown slides down
│   │   │
│   │   └─ Animation: slideDown (0.2s)
│   │
│   └─ Language Change
│       │
│       └─ 0ms ──→ Instant content update
│
└─ Cookie Accept/Reject
    │
    └─ 0ms ──────→ Banner fades out + stores in localStorage
```

---

## 🌐 Translation System

```
User Browser Language Detection
│
├─ Detected: it-IT ──→ Maps to: "it"
├─ Detected: en-US ──→ Maps to: "en"
├─ Detected: fr-FR ──→ Maps to: "fr"
├─ Detected: uk-UA ──→ Maps to: "uk"
└─ Unknown ──────────→ Fallback: "en"
         │
         ▼
┌──────────────────────────────────────┐
│     i18n Initialization              │
│                                      │
│  1. Load language from localStorage  │
│  2. If not found, detect browser     │
│  3. Fetch translation.json file      │
│  4. Render UI with translations      │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│   Component Uses Translation         │
│                                      │
│   const { t } = useTranslation();    │
│   t('landing.title', 'fallback')     │
│                                      │
│   Result: "Il modo più divertente..." │
└──────────────────────────────────────┘
```

---

## 🎨 Color System

```
Duolingo Brand Colors
├─ Primary Green ──→ #58cc02 (buttons, logo)
│   └─ Shadow ─────→ #46a302 (3D button effect)
│
├─ Primary Blue ───→ #1cb0f6 (links, secondary)
│
├─ Neutrals
│   ├─ Dark ───────→ #4b4b4b (text)
│   ├─ Medium ─────→ #777 (secondary text)
│   ├─ Light ──────→ #e5e5e5 (borders)
│   └─ Lighter ────→ #f7f7f7 (backgrounds)
│
└─ Special
    ├─ Orange ─────→ #ff9600 (Duo's beak)
    └─ Purple ─────→ Gradients (characters)
```

---

## 📐 Responsive Breakpoints

```
┌─────────────────────────────────────────────────┐
│              DESKTOP (>968px)                   │
│  ┌────────────────┬─────────────────┐          │
│  │  Illustration  │   CTA Section   │          │
│  │   (left 50%)   │   (right 50%)   │          │
│  └────────────────┴─────────────────┘          │
└─────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│          TABLET (640px - 968px)                 │
│  ┌───────────────────────────────────────┐     │
│  │         Illustration (top)            │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │         CTA Section (bottom)          │     │
│  └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│             MOBILE (<640px)                     │
│  ┌───────────────────────────────────────┐     │
│  │    Small Illustration (scaled down)   │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │    CTA Section (full width)           │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │    Cookie Banner (full width)         │     │
│  └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Security & Privacy

```
Cookie Consent System
│
├─ First Visit
│   │
│   ├─ Show banner ✓
│   ├─ No tracking until consent ✓
│   └─ localStorage: empty
│
├─ User Accepts
│   │
│   ├─ Store: cookieConsent = "accepted"
│   ├─ Hide banner
│   └─ Enable tracking (future feature)
│
└─ User Rejects
    │
    ├─ Store: cookieConsent = "rejected"
    ├─ Hide banner
    └─ No tracking enabled ✓

Note: Currently, no actual cookies are set.
The banner is for UX demonstration.
```

---

## ✅ Implementation Checklist

### Phase 1: Public Landing ✅ COMPLETE
- [x] Create PublicLanding.jsx
- [x] Create PublicLanding.css
- [x] Create logo.svg
- [x] Update App.jsx routes
- [x] Add translations (4 languages)
- [x] Implement language selector
- [x] Implement cookie banner
- [x] Add animations
- [x] Make responsive
- [x] Write documentation

### Phase 2: Registration (EXISTS)
- [x] Registration form
- [x] Email validation
- [x] Password validation
- [x] Google SSO
- [x] Redirect to onboarding

### Phase 3: Onboarding (EXISTS)
- [x] Multi-step wizard
- [x] Language selection
- [x] Goal selection
- [x] Level selection
- [x] Save to user profile

### Phase 4: Main App (EXISTS)
- [x] Home dashboard
- [x] Study sessions
- [x] Flashcard management
- [x] Progress tracking
- [x] AI chat
- [x] Settings

---

**Created**: 2025-01-19  
**Status**: ✅ COMPLETE  
**Ready to Use**: Yes! Run `npm run dev`
