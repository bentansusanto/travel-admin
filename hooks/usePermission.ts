"use client";

import { useGetUserQuery } from "@/store/services/auth.service";

export interface UserRole {
  id?: string;
  name?: string;
  code?: string;
  level?: number;
  permissions?: string[];
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  is_verified?: boolean;
  role_id?: string;
  role?: UserRole;
}

export const usePermission = () => {
  const { data: userData, isLoading } = useGetUserQuery(undefined);
  const user = userData?.data as UserProfile | undefined;
  const roleCode = user?.role?.code;
  const permissions: string[] = user?.role?.permissions || [];

  /**
   * Check if the user has one of the specified roles.
   * Super roles ('owner', 'developer') automatically return true.
   */
  const hasRole = (...roles: string[]): boolean => {
    if (!roleCode) return false;
    if (roleCode === "owner" || roleCode === "developer") return true;
    return roles.includes(roleCode);
  };

  /**
   * Check if the user has a specific permission.
   * Super roles ('owner', 'developer') or '*' permission automatically return true.
   * Supports wildcard prefixes like 'users:*' matching 'users:create'.
   */
  const hasPermission = (requiredPermission: string): boolean => {
    if (!roleCode) return false;
    if (roleCode === "owner" || roleCode === "developer") return true;
    if (permissions.includes("*")) return true;
    if (permissions.includes(requiredPermission)) return true;

    return permissions.some((userPerm) => {
      if (userPerm === "*") return true;
      if (userPerm === requiredPermission) return true;
      if (userPerm.endsWith(":*")) {
        const prefix = userPerm.slice(0, -2);
        return requiredPermission.startsWith(prefix);
      }
      return false;
    });
  };

  /**
   * Check if user has ALL specified permissions.
   */
  const hasAllPermissions = (...requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((perm) => hasPermission(perm));
  };

  /**
   * Check if user has AT LEAST ONE of specified permissions.
   */
  const hasAnyPermission = (...requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((perm) => hasPermission(perm));
  };

  return {
    user,
    roleCode,
    permissions,
    isLoading,
    hasRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  };
};
