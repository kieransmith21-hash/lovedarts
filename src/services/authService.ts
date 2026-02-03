/**
 * Authentication Service
 * 
 * Pure authentication service that handles only Supabase Auth operations.
 * - Signing users in/up/out
 * - Accessing current session or user
 * - Listening to authentication state changes
 * 
 * This service does NOT handle:
 * - Creating or updating application domain records
 * - Writing to application tables
 * - Business logic or data modeling
 * 
 * Imports Supabase client directly - no global dependencies.
 * No initialization required - use directly via import.
 */

import { supabaseClient } from '../supabase'

export interface AuthResponse {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
}

export interface AuthStateCallback {
  (user: any | null): void;
}

class AuthService {
  private supabaseClient: any;
  private authStateListeners: AuthStateCallback[] = [];

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
    this.initializeAuthStateListener();
  }

  /**
   * Initialize auth state listener to track session changes
   */
  private initializeAuthStateListener() {
    if (!this.supabaseClient?.auth) {
      console.error('Supabase client not properly initialized');
      return;
    }

    // Listen for auth state changes
    this.supabaseClient.auth.onAuthStateChange((event: string, session: any) => {
      const user = session?.user || null;
      this.notifyListeners(user);
    });
  }

  /**
   * Login with email and password
   * @param email User email address
   * @param password User password
   * @returns AuthResponse with success status and optional user/error
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: this.formatErrorMessage(error.message)
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'An unexpected error occurred during login'
      };
    }
  }

  /**
   * Sign up with email and password
   * @param email User email address
   * @param password User password
   * @returns AuthResponse with success status and optional user/error
   */
  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabaseClient.auth.signUp({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: this.formatErrorMessage(error.message)
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'An unexpected error occurred during signup'
      };
    }
  }

  /**
   * Logout current user
   * @returns AuthResponse with success status
   */
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await this.supabaseClient.auth.signOut();

      if (error) {
        return {
          success: false,
          error: 'Failed to logout'
        };
      }

      return {
        success: true
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'An unexpected error occurred during logout'
      };
    }
  }

  /**
   * Get current user session
   * @returns Current session or null if not authenticated
   */
  async getSession(): Promise<any> {
    try {
      const { data } = await this.supabaseClient.auth.getSession();
      return data.session;
    } catch (err: any) {
      return null;
    }
  }

  /**
   * Get current authenticated user
   * @returns Current user or null if not authenticated
   */
  async getUser(): Promise<any> {
    try {
      const { data } = await this.supabaseClient.auth.getUser();
      return data.user || null;
    } catch (err: any) {
      return null;
    }
  }

  /**
   * Register callback to be notified of auth state changes
   * @param callback Function to call with user (or null if logged out)
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: AuthStateCallback): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all registered listeners of auth state change
   */
  private notifyListeners(user: any | null) {
    this.authStateListeners.forEach((callback) => {
      try {
        callback(user);
      } catch (err) {
        console.error('Error in auth state change callback:', err);
      }
    });
  }

  /**
   * Format error messages for user display
   */
  private formatErrorMessage(rawError: string): string {
    // Map common Supabase error messages to user-friendly ones
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please confirm your email before logging in',
      'User already registered': 'This email is already registered',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'User not found': 'No account found with this email'
    };

    for (const [key, message] of Object.entries(errorMap)) {
      if (rawError.includes(key)) {
        return message;
      }
    }

    return 'Authentication failed. Please try again';
  }
}

// Export singleton instance - no global exposure
export const authService = new AuthService(supabaseClient)
