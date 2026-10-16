"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFindAllPermissionsQuery } from "@/store/services/permission.service";
import { useFindAllRolesQuery } from "@/store/services/role.service";
import { useFindAllUsersQuery } from "@/store/services/user.service";
import { IconKey, IconShieldCheck, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { PermissionsTab } from "./tabs/PermissionsTab";
import { RolesTab } from "./tabs/RolesTab";
import { UsersTab } from "./tabs/UsersTab";

export const Users = () => {
  const [activeTab, setActiveTab] = useState("users");

  const { data: usersData } = useFindAllUsersQuery(undefined);
  const { data: rolesData } = useFindAllRolesQuery(undefined);
  const { data: permissionsData } = useFindAllPermissionsQuery(undefined);

  const userCount = usersData?.data?.length ?? 0;
  const roleCount = rolesData?.data?.length ?? 0;
  const permissionCount = permissionsData?.data?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          User & Access Management
        </h1>
        <p className="text-xs text-slate-500">
          Manage internal staff accounts, roles, access levels, and granular permissions across the platform.
        </p>
      </div>

      {/* Internal Menu / Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-slate-100 p-0.5 rounded-xl h-auto border border-slate-200/60 inline-flex flex-wrap gap-1">
          {/* 1. Users Tab Trigger */}
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-600 gap-2 transition-all cursor-pointer">
            <IconUsers className="size-4 text-slate-400 data-[state=active]:text-blue-600" />
            <span>Staff Users</span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 h-4 text-[10px] font-bold bg-slate-200/70 text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              {userCount}
            </Badge>
          </TabsTrigger>

          {/* 2. Roles Tab Trigger */}
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-600 gap-2 transition-all cursor-pointer">
            <IconShieldCheck className="size-4 text-slate-400 data-[state=active]:text-blue-600" />
            <span>Roles & Access Levels</span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 h-4 text-[10px] font-bold bg-slate-200/70 text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              {roleCount}
            </Badge>
          </TabsTrigger>

          {/* 3. Permissions Tab Trigger */}
          <TabsTrigger
            value="permissions"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-600 gap-2 transition-all cursor-pointer">
            <IconKey className="size-4 text-slate-400 data-[state=active]:text-blue-600" />
            <span>Permissions Registry</span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 h-4 text-[10px] font-bold bg-slate-200/70 text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              {permissionCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 Content: Users */}
        <TabsContent value="users" className="mt-0 focus-visible:outline-none">
          <UsersTab />
        </TabsContent>

        {/* Tab 2 Content: Roles */}
        <TabsContent value="roles" className="mt-0 focus-visible:outline-none">
          <RolesTab />
        </TabsContent>

        {/* Tab 3 Content: Permissions */}
        <TabsContent value="permissions" className="mt-0 focus-visible:outline-none">
          <PermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
