/**
 * Profile Service
 * 
 * Handles application domain logic for user profiles.
 * Separate from authentication - manages only profile data.
 * 
 * Imports Supabase client directly - no global dependencies.
 * No initialization required - use directly via import.
 */

import { supabaseClient } from '../supabase'

export interface ProfileCreateRequest {
  userId: string;
  username: string;
}

export interface ProfileResponse {
  success: boolean;
  error?: string;
}

class ProfileService {
  private supabaseClient: any;

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Create a user profile
   * @param userId The authenticated user ID from Supabase Auth
   * @param username The username for the profile
   * @returns ProfileResponse with success status
   */
  async createUserProfile(userId: string, username: string): Promise<ProfileResponse> {
    try {
      const { error } = await this.supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          username: username
        });

      if (error) {
        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }

      return {
        success: true
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'An unexpected error occurred while creating profile'
      };
    }
  }
}

// Export singleton instance - no global exposure
export const profileService = new ProfileService(supabaseClient)
