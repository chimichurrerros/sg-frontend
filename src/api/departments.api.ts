import { apiClient } from "./client";
import type {
  DepartmentRequestDto,
  DepartmentWrapperDto,
  ListDepartmentsWrapperDto,
  OrganizationQueryDto,
} from "@/types/organization";

export const departmentsApi = {
  getDepartments: (params?: OrganizationQueryDto) =>
    apiClient.get<ListDepartmentsWrapperDto>("/api/departments", { params }).then((response) => response.data),
  createDepartment: (body: DepartmentRequestDto) =>
    apiClient.post<DepartmentWrapperDto>("/api/departments", body).then((response) => response.data),
  updateDepartment: (id: number, body: DepartmentRequestDto) =>
    apiClient.put<DepartmentWrapperDto>(`/api/departments/${id}`, body).then((response) => response.data),
  deleteDepartment: (id: number) =>
    apiClient.delete(`/api/departments/${id}`).then((response) => response.data),
};
