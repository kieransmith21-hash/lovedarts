/**
 * Signup Page Handler
 * 
 * Handles signup form submission and profile creation.
 * Imports and uses authService and profileService directly - no globals.
 */

import { authService } from '../services/authService'
import { profileService } from '../services/profileService'

/**
 * Handle signup form submission
 */
export async function handleSignup() {
  const email = (document.getElementById('signup-email') as HTMLInputElement).value.trim()
  const password = (document.getElementById('signup-password') as HTMLInputElement).value
  const username = (document.getElementById('signup-username') as HTMLInputElement).value.trim()
  const signupButton = document.getElementById('signup-button') as HTMLButtonElement
  const errorContainer = document.getElementById('signup-error') as HTMLDivElement

  // Clear previous error
  errorContainer.textContent = ''
  errorContainer.classList.remove('show')

  // Validate inputs
  if (!email || !password || !username) {
    showError(errorContainer, 'Please fill in all fields')
    return
  }

  if (!email.includes('@')) {
    showError(errorContainer, 'Please enter a valid email address')
    return
  }

  if (password.length < 6) {
    showError(errorContainer, 'Password must be at least 6 characters')
    return
  }

  if (username.length < 3) {
    showError(errorContainer, 'Username must be at least 3 characters')
    return
  }

  // Show loading state
  signupButton.disabled = true
  signupButton.classList.add('loading')
  const originalText = signupButton.textContent
  signupButton.textContent = ''

  try {
    // Step 1: Create auth user
    const signupResult = await authService.signup(email, password)

    if (!signupResult.success) {
      showError(errorContainer, signupResult.error || 'Signup failed')
      return
    }

    if (!signupResult.user || !signupResult.user.id) {
      showError(errorContainer, 'Failed to create user account')
      return
    }

    // Step 2: Create user profile
    const profileResult = await profileService.createUserProfile(
      signupResult.user.id,
      username
    )

    if (!profileResult.success) {
      showError(errorContainer, profileResult.error || 'Failed to create user profile')
      return
    }

    // Success - redirect to hub
    console.log('Signup and profile creation successful')
    window.location.href = 'hub.html'
  } catch (err: any) {
    console.error('Signup error:', err.message)
    showError(errorContainer, 'An unexpected error occurred. Please try again.')
  } finally {
    // Restore button state
    signupButton.disabled = false
    signupButton.classList.remove('loading')
    signupButton.textContent = originalText
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
    const signupBtn = document.getElementById('signup-button')
    if (signupBtn) {
      signupBtn.addEventListener('click', handleSignup)
    }

    const passwordInput = document.getElementById('signup-password') as HTMLInputElement
    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleSignup()
        }
      })
    }
  })
} else {
  const signupBtn = document.getElementById('signup-button')
  if (signupBtn) {
    signupBtn.addEventListener('click', handleSignup)
  }

  const passwordInput = document.getElementById('signup-password') as HTMLInputElement
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSignup()
      }
    })
  }
}
