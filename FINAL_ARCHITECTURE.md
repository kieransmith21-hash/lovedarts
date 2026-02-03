# Final Architecture - Import-Based, No Globals

## Overview

This document describes the final, strict architecture enforcing:
- **NO global exposure** - No `window.authService`, `window.profileService`, or `window.db`
- **NO initialization layer** - Deleted `init.js` and `supabase.js`
- **Pure module-based** - Services import dependencies directly via ES modules
- **TypeScript first** - Compiled to JavaScript for HTML consumption

## Module Structure

```
src/
├── supabase.ts                 (Supabase client initialization)
├── pages/
│   ├── login.ts                (Login page handler)
│   └── signup.ts               (Signup page handler)
└── services/
    ├── authService.ts          (Authentication only)
    └── profileService.ts       (User profile domain logic)
```

## File Responsibilities

### `src/supabase.ts`
- **Purpose**: Single, clean interface to Supabase client
- **Pattern**: Only legitimate place where global Supabase library is accessed
- **Code**:
  ```typescript
  export const supabaseClient = (window as any).supabase.createClient(URL, KEY)
  ```
- **Export**: `supabaseClient` singleton (no global exposure)
- **Usage**: Imported by `authService.ts` and `profileService.ts`

### `src/services/authService.ts`
- **Purpose**: Authentication-only operations (login, signup, logout, session management)
- **Dependency**: Imports `{ supabaseClient } from '../supabase'`
- **Export**: Singleton `authService` instance with methods:
  - `login(email, password)` - Authenticate user
  - `signup(email, password)` - Create new auth user
  - `logout()` - Sign out user
  - `getUser()` - Get current user
  - `getSession()` - Get current session
  - `onAuthStateChange(callback)` - Listen for auth changes
- **Critical Rule**: Does NOT create profiles or interact with app tables

### `src/services/profileService.ts`
- **Purpose**: User profile domain logic (separate from authentication)
- **Dependency**: Imports `{ supabaseClient } from '../supabase'`
- **Export**: Singleton `profileService` instance with methods:
  - `createUserProfile(userId, username)` - Create user profile after auth signup
- **Critical Rule**: Does NOT handle authentication

### `src/pages/login.ts`
- **Purpose**: Login page event handlers and form submission
- **Dependencies**:
  - Imports `{ authService } from '../services/authService'`
  - No globals needed
- **Export**: Function `handleLogin()` for form submission
- **Initialization**: Auto-wires event listeners when module loads

### `src/pages/signup.ts`
- **Purpose**: Signup page event handlers and form submission
- **Dependencies**:
  - Imports `{ authService } from '../services/authService'`
  - Imports `{ profileService } from '../services/profileService'`
  - No globals needed
- **Export**: Function `handleSignup()` for form submission
- **Flow**:
  1. Call `authService.signup()` to create auth user
  2. Call `profileService.createUserProfile()` to create profile
  3. Redirect to hub on success

## HTML Integration

### `index.html`
```html
<!-- Load Supabase library (required for supabase.ts module) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Load page handlers as ES modules -->
<script type="module" src="src/pages/login.ts"></script>
<script type="module" src="src/pages/signup.ts"></script>
```

**Notes:**
- Supabase library MUST load first (provides `window.supabase`)
- Page handlers load as ES modules (TypeScript or compiled JS)
- Build system compiles TypeScript to JavaScript for browser execution
- Event handlers auto-wire on module load

## Dependency Chain

```
Browser loads Supabase library globally (window.supabase)
                    ↓
        src/supabase.ts imports it, creates client, exports cleanly
                    ↓
        authService.ts + profileService.ts import supabaseClient
                    ↓
        src/pages/login.ts + signup.ts import services (no globals)
                    ↓
        index.html loads page modules, event handlers fire
```

## Key Architectural Rules

✅ **ENFORCED:**
- Services are singletons but only accessible via module imports
- No service exposes itself to `window` or global scope
- All Supabase access goes through clean module imports
- Separation of concerns: auth ≠ domain logic
- No initialization orchestration layer needed

❌ **FORBIDDEN:**
- `window.authService` - Must import instead
- `window.profileService` - Must import instead
- `window.db` - Obsolete; use supabase client via imports
- `init.js` - Initialization layer not allowed
- `supabase.js` - Deprecated; use src/supabase.ts instead
- Direct Supabase calls in UI - Must go through services

## Build Considerations

**TypeScript Compilation:**
- `src/pages/login.ts` → `dist/src/pages/login.js`
- `src/pages/signup.ts` → `dist/src/pages/signup.js`
- `src/services/authService.ts` → `dist/src/services/authService.js`
- `src/services/profileService.ts` → `dist/src/services/profileService.js`
- `src/supabase.ts` → `dist/src/supabase.js`

**HTML Script Tags:**
- Reference compiled JavaScript paths (e.g., `src/pages/login.ts` or `dist/src/pages/login.js`)
- Use `type="module"` for ES module syntax
- Supabase library must load first (global initialization)

## Behavior

✅ **User-facing behavior unchanged:**
- Login form still works the same
- Signup still creates auth user and profile
- Error messages display correctly
- Redirects to hub on success

✅ **Architecture strictly enforced:**
- No globals can be accessed
- Services require explicit imports
- Pure module dependency graph
- No initialization overhead

## Deleted Files

- ✅ `supabase.js` - Replaced by `src/supabase.ts`
- ✅ `signup.js` - Replaced by `src/pages/signup.ts`
- ✅ `src/services/init.js` - Initialization layer removed
- ✅ `src/services/authService.js` - Duplicate, TypeScript is source

## Files to Keep

- ✅ `index.html` - Updated with module script tags
- ✅ `hub.html` - No changes needed
- ✅ All `.ts` files in `src/`
