/**
 * Login Page Handler
 * 
 * Handles login form submission.
 * Imports and uses authService directly - no globals.
 */

import { authService } from '../services/authService'

/**
 * Handle login form submission
 */
export async function handleLogin() {
  const email = (document.getElementById('login-email') as HTMLInputElement).value.trim()
  const password = (document.getElementById('login-password') as HTMLInputElement).value
  const loginButton = document.getElementById('login-button') as HTMLButtonElement
  const errorContainer = document.getElementById('login-error') as HTMLDivElement

  // Clear previous error
  errorContainer.textContent = ''
  errorContainer.classList.remove('show')

  // Validate inputs
  if (!email || !password) {
    showError(errorContainer, 'Please enter both email and password')
    return
  }

  if (!email.includes('@')) {
    showError(errorContainer, 'Please enter a valid email address')
    return
  }

  // Show loading state
  loginButton.disabled = true
  loginButton.classList.add('loading')
  const originalText = loginButton.textContent
  loginButton.textContent = ''

  try {
    // Call auth service
    const result = await authService.login(email, password)

    if (result.success) {
      // Authentication successful - redirect to hub page
      console.log('Login successful')
      window.location.href = 'hub.html'
    } else {
      // Authentication failed - show error message
      showError(errorContainer, result.error || 'Login failed')
    }
  } catch (err: any) {
    console.error('Login error:', err.message)
    showError(errorContainer, 'An unexpected error occurred. Please try again.')
  } finally {
    // Restore button state
    loginButton.disabled = false
    loginButton.classList.remove('loading')
    loginButton.textContent = originalText
  }
}

/**
 * Display error message
 */
function showError(container: HTMLElement, message: string) {
  container.textContent = message
  container.classList.add('show')
}

// Initialize when DOM loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-button')
    if (loginBtn) {
      loginBtn.addEventListener('click', handleLogin)
    }

    const passwordInput = document.getElementById('login-password') as HTMLInputElement
    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleLogin()
        }
      })
    }
  })
} else {
  const loginBtn = document.getElementById('login-button')
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin)
  }

  const passwordInput = document.getElementById('login-password') as HTMLInputElement
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLogin()
      }
    })
  }
}
