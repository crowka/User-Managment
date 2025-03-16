import { z } from 'zod';

// Profile validation schemas
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');
export const bioSchema = z.string().max(500, 'Bio must be less than 500 characters').optional();
export const locationSchema = z.string().optional();
export const websiteSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

// Profile types
export interface Profile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Profile form schema
export const profileSchema = z.object({
  name: nameSchema,
  bio: bioSchema,
  location: locationSchema,
  website: websiteSchema,
  isPublic: z.boolean().default(true),
});

// Infer type from schema
export type ProfileFormData = z.infer<typeof profileSchema>;

// Profile store types
export interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  removeAvatar: () => Promise<boolean>;
  clearError: () => void;
} 