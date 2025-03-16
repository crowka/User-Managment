import { z } from 'zod';

// Define available permissions
export enum Permission {
  // User management
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',
  
  // Profile management
  READ_PROFILES = 'read:profiles',
  UPDATE_PROFILES = 'update:profiles',
  DELETE_PROFILES = 'delete:profiles',
  
  // Settings management
  READ_SETTINGS = 'read:settings',
  UPDATE_SETTINGS = 'update:settings',
  
  // Role management
  READ_ROLES = 'read:roles',
  CREATE_ROLES = 'create:roles',
  UPDATE_ROLES = 'update:roles',
  DELETE_ROLES = 'delete:roles',
  ASSIGN_ROLES = 'assign:roles',
  
  // System management
  MANAGE_SYSTEM = 'manage:system',
}

// Define available roles
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

// Role schema with permissions
export const roleSchema = z.object({
  id: z.string(),
  name: z.nativeEnum(Role),
  description: z.string().optional(),
  permissions: z.array(z.nativeEnum(Permission)),
  isSystem: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RoleSchema = z.infer<typeof roleSchema>;

// User role assignment schema
export const userRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  assignedBy: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type UserRoleSchema = z.infer<typeof userRoleSchema>;

// RBAC store state
export interface RBACState {
  roles: RoleSchema[];
  userRoles: UserRoleSchema[];
  isLoading: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  removeRole: (userId: string, roleId: string) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  clearError: () => void;
}

// Helper type for role-based component props
export interface WithRoleProps {
  requiredRole?: Role;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
} 