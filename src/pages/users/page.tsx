import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { container } from "@/utils/di/inversify.config";
import UserManagementService, { CreateUserRequest, UserResponse } from "@/utils/services/user-management-service";
import { showPopup } from "@/utils/helpers/popup-helper";
import { useSelector } from "react-redux";
import { RootState } from "@/state-management/store/app-store";

export default function UsersPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [activeResetUserId, setActiveResetUserId] = useState<string | null>(null);
  const [activeDeactivateUserId, setActiveDeactivateUserId] = useState<string | null>(null);
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    profileURL: "",
    password: "",
    roleId: 1,
  });
  const userManagementService = container.get(UserManagementService);
  const { role, roleId } = useSelector((state: RootState) => state.auth);

  const isAdmin = useMemo(() => {
    const normalizedRole = (role || "").toString().toLowerCase();
    return roleId === 2 || normalizedRole === "admin";
  }, [role, roleId]);

  const loadUsers = async () => {
    if (!isAdmin) {
      setIsLoadingUsers(false);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const res = await userManagementService.getUsers();
      if (res.successResponse?.data) {
        setUsers(res.successResponse.data);
      } else {
        setUsers([]);
        showPopup({
          title: "Unable to load users",
          body: res.errorResponse?.message || "Failed to load users.",
          type: "error",
        });
      }
    } catch {
      showPopup({
        title: "Error",
        body: "A network error occurred while loading users.",
        type: "error",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [isAdmin]);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: name === "roleId" ? Number(value) : value,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.email || !createForm.firstName || !createForm.lastName || !createForm.password) {
      showPopup({
        title: "Missing fields",
        body: "Email, first name, last name, and password are required.",
        type: "error",
      });
      return;
    }

    if (createForm.password.length < 8) {
      showPopup({
        title: "Invalid password",
        body: "Password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      const payload: CreateUserRequest = {
        ...createForm,
        middleName: createForm.middleName || undefined,
        profileURL: createForm.profileURL || undefined,
      };

      const res = await userManagementService.createUser(payload);
      if (res.successResponse) {
        showPopup({
          title: "User created",
          body: "User created successfully.",
          type: "success",
        });
        setCreateForm({
          email: "",
          firstName: "",
          lastName: "",
          middleName: "",
          profileURL: "",
          password: "",
          roleId: 1,
        });
        await loadUsers();
      } else {
        showPopup({
          title: "Create failed",
          body: res.errorResponse?.message || "Could not create user.",
          type: "error",
        });
      }
    } catch {
      showPopup({
        title: "Error",
        body: "A network error occurred while creating user.",
        type: "error",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const parseUserId = (id: string) => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleResetPassword = async (user: UserResponse) => {
    const newPassword = resetPasswords[user.id] || "";
    if (!newPassword) {
      showPopup({
        title: "Missing password",
        body: "Please enter a new password before resetting.",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 8) {
      showPopup({
        title: "Invalid password",
        body: "Reset password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }

    const parsedUserId = parseUserId(user.id);
    if (parsedUserId === null) {
      showPopup({
        title: "Invalid user id",
        body: "User ID is not numeric and cannot be sent to reset-password endpoint.",
        type: "error",
      });
      return;
    }

    setActiveResetUserId(user.id);
    try {
      const res = await userManagementService.resetPassword(parsedUserId, newPassword);
      if (res.successResponse) {
        showPopup({
          title: "Password reset",
          body: "User password reset successfully.",
          type: "success",
        });
        setResetPasswords((prev) => ({ ...prev, [user.id]: "" }));
      } else {
        showPopup({
          title: "Reset failed",
          body: res.errorResponse?.message || "Could not reset password.",
          type: "error",
        });
      }
    } catch {
      showPopup({
        title: "Error",
        body: "A network error occurred while resetting password.",
        type: "error",
      });
    } finally {
      setActiveResetUserId(null);
    }
  };

  const handleDeactivateUser = async (user: UserResponse) => {
    const shouldDeactivate = window.confirm(`Deactivate ${user.firstName} ${user.lastName}?`);
    if (!shouldDeactivate) {
      return;
    }

    const parsedUserId = parseUserId(user.id);
    if (parsedUserId === null) {
      showPopup({
        title: "Invalid user id",
        body: "User ID is not numeric and cannot be sent to deactivate endpoint.",
        type: "error",
      });
      return;
    }

    setActiveDeactivateUserId(user.id);
    try {
      const res = await userManagementService.deactivateUser(parsedUserId);
      if (res.successResponse) {
        showPopup({
          title: "User deactivated",
          body: "User deactivated successfully.",
          type: "success",
        });
        await loadUsers();
      } else {
        showPopup({
          title: "Deactivate failed",
          body: res.errorResponse?.message || "Could not deactivate user.",
          type: "error",
        });
      }
    } catch {
      showPopup({
        title: "Error",
        body: "A network error occurred while deactivating user.",
        type: "error",
      });
    } finally {
      setActiveDeactivateUserId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">Create users, reset passwords, and manage active accounts.</p>
            </div>
          </div>

          {!isAdmin ? (
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle>Access Restricted</CardTitle>
                <CardDescription>This module is only available to administrators.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Your account does not have permission to manage users.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="border-border/40 shadow-sm lg:col-span-4">
                <CardHeader>
                  <CardTitle className="text-xl">Create User</CardTitle>
                  <CardDescription>Add a new user and assign a role.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={createForm.email} onChange={handleCreateChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" value={createForm.firstName} onChange={handleCreateChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" value={createForm.lastName} onChange={handleCreateChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input id="middleName" name="middleName" value={createForm.middleName || ""} onChange={handleCreateChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileURL">Profile URL</Label>
                      <Input id="profileURL" name="profileURL" value={createForm.profileURL || ""} onChange={handleCreateChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" value={createForm.password} onChange={handleCreateChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleId">Role</Label>
                      <select
                        id="roleId"
                        name="roleId"
                        value={createForm.roleId}
                        onChange={handleCreateChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value={1}>User</option>
                        <option value={2}>Admin</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreatingUser}>
                      {isCreatingUser ? "Creating..." : "Create User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-sm lg:col-span-8">
                <CardHeader>
                  <CardTitle className="text-xl">Existing Users</CardTitle>
                  <CardDescription>Manage passwords and activation status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingUsers ? (
                    <div className="text-sm text-muted-foreground">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                      No users found. Create your first user from the form.
                    </div>
                  ) : (
                    users.map((user) => {
                      const isResetting = activeResetUserId === user.id;
                      const isDeactivating = activeDeactivateUserId === user.id;
                      const isBusy = isResetting || isDeactivating;
                      return (
                        <div key={user.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                                {user.roleId === 2 ? "Admin" : "User"}
                              </span>
                              <span className={`px-2 py-1 rounded ${user.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-3 md:items-center">
                            <Input
                              type="password"
                              placeholder="New password (min 8)"
                              value={resetPasswords[user.id] || ""}
                              onChange={(e) => setResetPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))}
                              disabled={isBusy}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleResetPassword(user)}
                              disabled={isBusy}
                            >
                              {isResetting ? "Resetting..." : "Reset Password"}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => handleDeactivateUser(user)}
                              disabled={isBusy || !user.isActive}
                            >
                              {isDeactivating ? "Deactivating..." : "Deactivate"}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
