import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumbers: string;
  roleName: string;
}

export interface UserDto {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumbers: string[];
  roleName: string;        // ← "Admin" | "User"
}

export interface UserWrapperDto {
  user: UserDto;
}

export interface LoginRequest    { email: string; password: string; }
export interface RegisterRequest { name: string; lastName: string; email: string; password: string; }

export const authApi = {
  login:    (data: LoginRequest)    => apiClient.post<UserWrapperDto>("/api/auth/login", data).then(r => r.data),
  register: (data: RegisterRequest) => apiClient.post("/api/auth/register", data).then(r => r.data),
  logout:   ()                      => apiClient.post("/api/auth/logout").then(r => r.data),
  me:       ()                      => apiClient.get<UserWrapperDto>("/api/profile").then(r => r.data),
};