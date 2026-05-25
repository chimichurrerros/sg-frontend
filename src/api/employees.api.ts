import { apiClient } from "./client";
import type {
  CreateEmployeePositionHistoryRequestDto,
  CreateEmployeeRelationRequestDto,
  CreateEmployeeRequestDTO,
  EmployeePositionHistoryWrapperDto,
  EmployeeRelationWrapperDto,
  EmployeeWrapperDto,
  ListEmployeePositionHistoriesWrapperDto,
  ListEmployeeRelationsWrapperDto,
  ListEmployeesWrapperDto,
  UpdateEmployeeRequestDTO,
} from "@/types/employees";
import type { PaginationParams } from "@/types/types";

export const employeesApi = {
  getAllEmployees: (params?: PaginationParams) =>
    apiClient
      .get<ListEmployeesWrapperDto>("/api/employees", {
        params: {
          Page: params?.page,
          PageSize: params?.pageSize,
        },
      })
      .then((response) => response.data),
  getEmployeeById: (id: number) =>
    apiClient
      .get<EmployeeWrapperDto>(`/api/employees/${id}`)
      .then((response) => response.data),
  createEmployee: (body: CreateEmployeeRequestDTO) =>
    apiClient
      .post<EmployeeWrapperDto>("/api/employees", body)
      .then((response) => response.data),
  updateEmployee: (id: number, body: UpdateEmployeeRequestDTO) =>
    apiClient
      .put<EmployeeWrapperDto>(`/api/employees/${id}`, body)
      .then((response) => response.data),
  deleteEmployee: (id: number) =>
    apiClient.delete(`/api/employees/${id}`).then((response) => response.data),
  getEmployeePositionHistory: (id: number) =>
    apiClient
      .get<ListEmployeePositionHistoriesWrapperDto>(`/api/employees/${id}/position-history`)
      .then((response) => response.data),
  createEmployeePositionHistory: (id: number, body: CreateEmployeePositionHistoryRequestDto) =>
    apiClient
      .post<EmployeePositionHistoryWrapperDto>(`/api/employees/${id}/position-history`, body)
      .then((response) => response.data),
  getEmployeeRelations: (id: number) =>
    apiClient
      .get<ListEmployeeRelationsWrapperDto>(`/api/employees/${id}/relations`)
      .then((response) => response.data),
  createEmployeeRelation: (id: number, body: CreateEmployeeRelationRequestDto) =>
    apiClient
      .post<EmployeeRelationWrapperDto>(`/api/employees/${id}/relations`, body)
      .then((response) => response.data),
};