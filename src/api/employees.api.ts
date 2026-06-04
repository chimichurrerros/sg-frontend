import { apiClient } from "./client";
import type { GenderEnum, MaritalStatusEnum, RelationTypeEnum } from "@/types/employees";
import type { PaginationParams } from "@/types/types";

export interface CreateEmployeeRequestDTO {
  fileNumber?: string;
  hireDate: string;
  areaId: number;
  branchId?: number | null;
  inmediatlyBossId?: number | null;
  positionId: number;
  scheduleId: number;
  basicSalary: number;
  positionStartDate: string;
  name: string;
  lastname: string;
  birthDate: string;
  gender: GenderEnum;
  maritalStatus: MaritalStatusEnum;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface UpdateEmployeeRequestDTO {
  fileNumber?: string;
  hireDate: string;
  areaId: number;
  branchId?: number | null;
  inmediatlyBossId?: number | null;
  name: string;
  lastname: string;
  birthDate: string;
  gender: GenderEnum;
  maritalStatus: MaritalStatusEnum;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface CreateEmployeePositionHistoryRequestDto {
  positionId: number;
  scheduleId: number;
  basicSalary: number;
  startDate: string;
}

export interface CreateEmployeeRelationRequestDto {
  relationType: RelationTypeEnum;
  name: string;
  lastname: string;
  documentNumber: string;
  birthDate: string;
}

export interface EmployeeResponseDto {
  id: number;
  fileNumber: string | null;
  areaId: number;
  areaName: string | null;
  branchId: number | null;
  branchName: string | null;
  inmediatlyBossId: number | null;
  hireDate: string;
  maritalStatus: number;
  name: string | null;
  lastname: string | null;
  birthDate: string | null;
  gender: GenderEnum;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  positionId?: number | null;
  positionName?: string | null;
  scheduleId?: number | null;
  scheduleName?: string | null;
  baseSalary: number | null;
  positionStartDate: string | null;
  bankId?: number | null;
  bankAccountNumber?: string | null;
}

export interface EmployeeWrapperDto {
  employee: EmployeeResponseDto;
}

export interface ListEmployeesWrapperDto {
  employees: EmployeeResponseDto[];
  pagination: import("@/types/types").PaginationType | null;
}

export interface EmployeePositionHistoryResponseDto {
  id: number;
  employeeId: number;
  positionId: number;
  positionName: string | null;
  scheduleId: number;
  scheduleType: number;
  scheduleName: string | null;
  basicSalary: number;
  startDate: string;
  endDate: string | null;
}

export interface EmployeePositionHistoryWrapperDto {
  history: EmployeePositionHistoryResponseDto;
}

export interface UpdateEmployeePositionHistoryRequestDto {
  positionId: number;
  scheduleId: number;
  basicSalary: number;
  startDate: string;
  endDate?: string | null;
}

export interface ListEmployeePositionHistoriesWrapperDto {
  histories: EmployeePositionHistoryResponseDto[] | null;
}

export interface EmployeeRelationResponseDto {
  id: number;
  employeeId: number;
  relationType: number;
  name: string | null;
  lastname: string | null;
  documentNumber: string | null;
  birthDate: string;
}

export interface EmployeeRelationWrapperDto {
  relation: EmployeeRelationResponseDto;
}

export interface ListEmployeeRelationsWrapperDto {
  relations: EmployeeRelationResponseDto[] | null;
  pagination: import("@/types/types").PaginationType | null;
}

export const employeesApi = {
  getAllEmployees: (params?: PaginationParams) =>
    apiClient
      .get<ListEmployeesWrapperDto>("/api/employees", {
        params,
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
  updateEmployeePositionHistory: (
    id: number,
    historyId: number,
    body: UpdateEmployeePositionHistoryRequestDto,
  ) =>
    apiClient
      .put<EmployeePositionHistoryWrapperDto>(`/api/employees/${id}/position-history/${historyId}`, body)
      .then((response) => response.data),
  deleteEmployeePositionHistory: (id: number, historyId: number) =>
    apiClient
      .delete(`/api/employees/${id}/position-history/${historyId}`)
      .then((response) => response.data),
  getEmployeeRelations: (id: number) =>
    apiClient
      .get<ListEmployeeRelationsWrapperDto>(`/api/employees/${id}/relations`)
      .then((response) => response.data),
  createEmployeeRelation: (id: number, body: CreateEmployeeRelationRequestDto) =>
    apiClient
      .post<EmployeeRelationWrapperDto>(`/api/employees/${id}/relations`, body)
      .then((response) => response.data),
  updateEmployeeRelation: (
    id: number,
    relationId: number,
    body: CreateEmployeeRelationRequestDto,
  ) =>
    apiClient
      .put<EmployeeRelationWrapperDto>(`/api/employees/${id}/relations/${relationId}`, body)
      .then((response) => response.data),
  deleteEmployeeRelation: (id: number, relationId: number) =>
    apiClient
      .delete(`/api/employees/${id}/relations/${relationId}`)
      .then((response) => response.data),
};