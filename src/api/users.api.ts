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
  isActive: boolean;
  createdAt: string;
}

export interface ListUsersWrapperDto {
  users: UserDto[];
}

export interface UserWrapperDto {
  user: UserDto;
}

export const usersApi = {
  get: (data: UserRequest) =>
    apiClient
      .get<UserWrapperDto>("/api/users", { params: { id: data.id } })
      .then((r) => r.data),
  getAll: () =>
    apiClient.get<ListUsersWrapperDto>("/api/users").then((r) => r.data),
};
