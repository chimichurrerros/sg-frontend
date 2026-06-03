import { apiClient } from "./client";

export interface UserRequest {
  id?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumbers: string;
  roleName: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phoneNumbers: string[];
  roleName: string; // ← "Admin" | "User"
  roleId: number;
  isActive: boolean;
  createdAt: string;
  branchId: number;
  branchName: string;
  permissions?: string[];
}

export interface ListUsersWrapperDto {
  users: UserDto[];
}

export interface UserWrapperDto {
  user: UserDto;
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
  isActive?: boolean;
  branchId?: number;
}

export const usersApi = {
  get: (id: string | number) =>
    apiClient
      .get<UserWrapperDto>(`/api/users/${id}`)
      .then((r) => r.data),
  getAll: () =>
    apiClient.get<ListUsersWrapperDto>("/api/users").then((r) => r.data),
  toggleActive: (id: number) =>
    apiClient.patch(`/api/users/${id}/status`).then((r) => r.data),
  update: (id: number, data: UpdateUserRequest) =>
    apiClient.put<UserWrapperDto>(`/api/users/${id}`, data).then((r) => r.data),
  updateRole: (id: number, roleId: number) =>
    apiClient.put<UserWrapperDto>(`/api/users/${id}/role`, { roleId }).then((r) => r.data),
};
