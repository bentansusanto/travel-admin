"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback = null
}) => {
  const { hasRole, hasAnyPermission, isLoading } = usePermission();

  if (isLoading) {
    return null;
  }

  // If roles are specified, check if user has at least one of the roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasRole(...requiredRoles)) {
      return <>{fallback}</>;
    }
  }

  // If permissions are specified, check if user has at least one of the permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(...requiredPermissions)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
