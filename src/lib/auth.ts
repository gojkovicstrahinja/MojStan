import { supabase } from './supabase'
import type { User, LoginFormData, RegisterFormData } from '../types'
import { translateAuthError } from './errorTranslation'

export class AuthService {
  // Sign up new user
  static async signUp(data: RegisterFormData) {
    try {
      console.log('Starting user registration for:', data.email)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            user_type: data.user_type,
            phone: data.phone
          }
        }
      })

      if (authError) {
        console.error('Supabase auth signup error:', authError)
        const translatedError = new Error(translateAuthError(authError))
        throw translatedError
      }

      console.log('Auth signup successful, user ID:', authData.user?.id)

      // Insert user profile into users table
      if (authData.user) {
        console.log('Inserting user profile into users table')
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            user_type: data.user_type,
            phone: data.phone
          })

        if (profileError) {
          console.error('Profile insertion error:', profileError)
          const translatedError = new Error(translateAuthError(profileError))
          throw translatedError
        }
        
        console.log('User profile inserted successfully')
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('Registration failed:', error)
      return { data: null, error: error as Error }
    }
  }

  // Sign in user
  static async signIn(data: LoginFormData) {
    try {
      console.log('Attempting login for:', data.email)
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        console.error('Login error:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status
        })
        const translatedError = new Error(translateAuthError(error))
        throw translatedError
      }

      console.log('Login successful for user:', authData.user?.id)
      return { data: authData, error: null }
    } catch (error) {
      console.error('Login failed:', error)
      return { data: null, error: error as Error }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        const translatedError = new Error(translateAuthError(error))
        throw translatedError
      }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        const translatedError = new Error(translateAuthError(error))
        throw translatedError
      }

      if (!user) return { data: null, error: null }

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        const translatedError = new Error(translateAuthError(profileError))
        throw translatedError
      }

      return { data: profile as User, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        const translatedError = new Error(translateAuthError(error))
        throw translatedError
      }

      return { data: data as User, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        const translatedError = new Error(translateAuthError(error))
        throw translatedError
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        const translatedError = new Error(translateAuthError(error))
        throw translatedError
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
}