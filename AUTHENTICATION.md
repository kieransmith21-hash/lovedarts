# Love Darts Authentication Architecture

## Overview

This document describes the authentication system for Love Darts. All authentication logic is centralized in a single service to prevent coupling, ensure security, and enable maintainability.

## Architecture

### Core Principle

**All authentication logic lives in `src/services/authService.js`.**

UI components and pages must **never** call Supabase authentication APIs directly. All authentication operations go through the `authService` object exposed on `window.authService`.

### File Structure

```
lovedarts/
├── src/
│   └── services/
│       ├── authService.ts       # TypeScript version (for future TypeScript migrations)
│       └── authService.js       # JavaScript version (current, used in HTML)
├── index.html                   # Login page (uses authService)
├── hub.html                     # Hub page (post-login)
├── signup.js                    # Signup form (uses authService)
├── supabase.js                  # Supabase client initialization
└── ...
```

## Authentication Service API

The `authService` object provides the following methods:

### `login(email: string, password: string): Promise<AuthResponse>`

Authenticates a user with email and password.

**Usage:**
```javascript
const result = await authService.login('user@example.com', 'password123');

if (result.success) {
  // User authenticated, redirect to hub
  window.location.href = 'hub.html';
} else {
  // Show error: result.error
  console.error(result.error);
}
```

**Response:**
```javascript
{
  success: true,
  user: { id: '...', email: '...' },
  session: { access_token: '...', ... }
}
// OR
{
  success: false,
  error: 'Invalid email or password'
}
```

### `signup(email: string, password: string): Promise<AuthResponse>`

Creates a new user account with email and password.

**Usage:**
```javascript
const result = await authService.signup('newuser@example.com', 'password123');

if (result.success) {
  // Create user profile in database
  // Then redirect to login
} else {
  console.error(result.error);
}
```

**Response:** Same as `login()`

### `logout(): Promise<AuthResponse>`

Logs out the current user and clears the session.

**Usage:**
```javascript
const result = await authService.logout();

if (result.success) {
  window.location.href = 'index.html';
} else {
  console.error(result.error);
}
```

### `getUser(): Promise<User | null>`

Returns the currently authenticated user, or null if not logged in.

**Usage:**
```javascript
const user = await authService.getUser();

if (user) {
  console.log('Current user:', user.email);
} else {
  console.log('Not authenticated');
}
```

### `getSession(): Promise<Session | null>`

Returns the current session, or null if no active session.

**Usage:**
```javascript
const session = await authService.getSession();

if (session) {
  console.log('Session token:', session.access_token);
}
```

### `onAuthStateChange(callback): () => void`

Registers a callback to be notified whenever the authentication state changes.

**Usage:**
```javascript
const unsubscribe = authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// To stop listening:
unsubscribe();
```

## Usage in HTML Pages

### Loading the Service

The authService is automatically initialized when the page loads. Include it in your HTML:

```html
<!-- Load Supabase library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Load Supabase client initialization -->
<script src="supabase.js"></script>

<!-- Load authentication service -->
<script src="src/services/authService.js"></script>

<!-- Your page script -->
<script src="your-page.js"></script>
```

### Example: Login Form

```javascript
async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const result = await window.authService.login(email, password);

  if (result.success) {
    window.location.href = 'hub.html';
  } else {
    alert(result.error);
  }
}
```

### Example: Protected Page

```javascript
// Check if user is authenticated
window.authService.onAuthStateChange((user) => {
  if (!user) {
    // Not authenticated, redirect to login
    window.location.href = 'index.html';
  } else {
    // User is authenticated, show page content
    console.log('Welcome,', user.email);
  }
});
```

## Security Constraints (Hard Rules)

✓ **Do NOT** query database tables to validate credentials.
✓ **Do NOT** compare, hash, or inspect passwords in frontend code.
✓ **Do NOT** log email, password, session, or token data.
✓ **Do NOT** store passwords beyond the login/signup function scope.
✓ **Do NOT** implement custom authentication logic outside Supabase Auth.

All of these are handled exclusively by Supabase Auth and never exposed in frontend code.

## Error Handling

The authService provides user-friendly error messages:

- `Invalid email or password` - Wrong credentials
- `Please confirm your email before logging in` - Email not verified
- `This email is already registered` - Signup duplicate
- `Password must be at least 6 characters` - Weak password
- `Authentication failed. Please try again` - Generic error fallback

These messages are mapped from raw Supabase error strings in the `formatErrorMessage()` method.

## Loading States and UI Feedback

When calling `authService.login()` or `authService.signup()`, the UI should:

1. Disable the submit button
2. Show a loading spinner or animation
3. Clear any previous error messages
4. Wait for the Promise to resolve
5. Restore the button state when complete
6. Show errors if `result.success` is false
7. Redirect on success

Example in [index.html](index.html):
- Loading state: Button disabled with spinning animation
- Error display: Red banner with user-friendly message
- Success: Redirect to hub.html

## Future: OAuth Provider Support

The authService is structured to easily support OAuth providers (Google, Apple) in the future:

```javascript
// Future: OAuth logins
async loginWithGoogle(options) { ... }
async loginWithApple(options) { ... }
```

These would follow the same pattern:
- Single method in authService
- No direct Supabase calls from UI
- Consistent error handling and response format

## Migration to TypeScript

As the project scales, the TypeScript version (`src/services/authService.ts`) provides:
- Full type safety with AuthResponse, AuthStateCallback types
- Better IDE support and autocomplete
- Documentation via JSDoc and type hints

To migrate:
1. Build TypeScript to JavaScript
2. Update script tags to use compiled output
3. No changes required in calling code (same API)

## Testing

To test the authentication flow:

1. **Login:** Visit `index.html`, enter valid Supabase credentials
2. **Error handling:** Enter invalid credentials, verify error message
3. **Loading state:** Click login, verify button is disabled during request
4. **Success:** After login, verify redirect to `hub.html`
5. **Signup:** Visit signup section, create new account, verify database profile created

## Troubleshooting

### "Auth service not initialized"
- Ensure `supabase.js` loads before `authService.js`
- Check browser console for initialization errors

### "Invalid login credentials"
- Verify user exists in Supabase Auth
- Check email spelling and case sensitivity
- Passwords are case-sensitive

### Network errors
- Check Supabase project status
- Verify CORS configuration in Supabase
- Check browser network tab for API responses

## Related Files

- [index.html](index.html) - Login page implementation
- [signup.js](signup.js) - Signup form using authService
- [hub.html](hub.html) - Post-login hub page
- [supabase.js](supabase.js) - Supabase client initialization
