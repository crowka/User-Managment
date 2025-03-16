import { useEffect } from 'react';
import { useRBACStore } from '@/lib/stores/rbac.store';
import { WithRoleProps } from '@/lib/types/rbac';
import { useAuthStore } from '@/lib/stores/auth.store';

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole, requiredPermissions, fallback }: WithRoleProps = {}
) {
  return function WithRoleComponent(props: P) {
    const { hasRole, hasPermission, fetchUserRoles } = useRBACStore();
    const { user } = useAuthStore();

    useEffect(() => {
      if (user) {
        fetchUserRoles(user.id);
      }
    }, [user, fetchUserRoles]);

    // Check role requirements
    if (requiredRole && !hasRole(requiredRole)) {
      return fallback || null;
    }

    // Check permission requirements
    if (requiredPermissions?.length) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        hasPermission(permission)
      );
      if (!hasAllPermissions) {
        return fallback || null;
      }
    }

    return <WrappedComponent {...props} />;
  };
} 