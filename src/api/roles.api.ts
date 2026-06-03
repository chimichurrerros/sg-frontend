import { apiClient } from "./client";

export interface RoleDto {
  id: number;
  name: string;
  permissions: string[];
}

export interface RoleWrapperDto {
  role: RoleDto;
}

export interface ListRolesWrapperDto {
  roles: RoleDto[];
}

export interface RoleRequest {
  name: string;
}

export interface SyncRolePermissionsRequest {
  permissions: string[];
}

export const rolesApi = {
  getAll: () =>
    apiClient.get<ListRolesWrapperDto>("/api/roles").then((r) => r.data),
  getById: (id: number) =>
    apiClient.get<RoleWrapperDto>(`/api/roles/${id}`).then((r) => r.data),
  create: (data: RoleRequest) =>
    apiClient.post<RoleWrapperDto>("/api/roles", data).then((r) => r.data),
  update: (id: number, data: RoleRequest) =>
    apiClient.put<RoleWrapperDto>(`/api/roles/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete(`/api/roles/${id}`).then((r) => r.data),
  syncPermissions: (id: number, data: SyncRolePermissionsRequest) =>
    apiClient
      .post<RoleWrapperDto>(`/api/roles/${id}/permissions`, data)
      .then((r) => r.data),
};
