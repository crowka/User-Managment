import { User, Profile, UserPreferences, ActivityLog, UserWithRelations } from '../types/database';

export interface DatabaseProvider {
  // User operations
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  getUserById: (id: string) => Promise<User | null>;
  getUserByEmail: (email: string) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  // Profile operations
  createProfile: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Profile>;
  getProfileByUserId: (userId: string) => Promise<Profile | null>;
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<Profile>;
  deleteProfile: (userId: string) => Promise<void>;

  // User preferences operations
  createUserPreferences: (data: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserPreferences>;
  getUserPreferences: (userId: string) => Promise<UserPreferences | null>;
  updateUserPreferences: (userId: string, data: Partial<UserPreferences>) => Promise<UserPreferences>;
  deleteUserPreferences: (userId: string) => Promise<void>;

  // Activity log operations
  createActivityLog: (data: Omit<ActivityLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ActivityLog>;
  getUserActivityLogs: (userId: string, options?: { limit?: number; offset?: number }) => Promise<ActivityLog[]>;
  deleteUserActivityLogs: (userId: string) => Promise<void>;

  // Relationship operations
  getUserWithRelations: (id: string) => Promise<UserWithRelations | null>;
}

export interface DatabaseConfig {
  provider: 'supabase' | 'postgresql' | 'mysql';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
  };
} 