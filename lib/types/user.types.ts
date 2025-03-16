import { type User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_public: boolean
  is_verified: boolean
  role: 'user' | 'admin'
  subscription_tier: 'free' | 'premium'
  account_type: 'personal' | 'corporate'
  notification_preferences: NotificationPreferences
  privacy_settings: PrivacySettings
  theme_preference: 'light' | 'dark' | 'system'
  language_preference: string
  last_sign_in: string | null
  two_factor_enabled: boolean
}

export type NotificationPreferences = {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  security_alerts: boolean
}

export type PrivacySettings = {
  profile_visibility: 'public' | 'private'
  show_email: boolean
  show_activity: boolean
}

export type UserWithProfile = User & {
  profile: Profile
} 