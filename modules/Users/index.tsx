"use client";

import UsersDataTable from "@/app/dashboard/users/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteUserMutation, useFindAllUsersQuery } from "@/store/services/user.service";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddUserModal } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";

export const Users = () => {
  const { data, isLoading, isError, error } = useFindAllUsersQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-500">Error loading users: {error?.toString()}</p>
      </div>
    );
  }

  const users = data?.data || [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          <PlusCircledIcon /> Add New User
        </Button>
      </div>
      <Card>
        <CardContent>
          <UsersDataTable data={users} onDelete={handleDelete} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <AddUserModal open={isModalOpen} onOpenChange={setIsModalOpen} existingUsers={users} />
      <EditUserModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} user={selectedUser} />
    </>
  );
};
