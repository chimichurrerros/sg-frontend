import type { PaginationType } from "@/types/types";

export type MaritalStatusEnum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type RelationTypeEnum = 1 | 2;

export interface LookupReferenceDto {
  id?: number;
  name?: string | null;
}

export interface EmployeeResponseDto {
  id: number;
  entityId: number;
  fileNumber: string | null;
  areaId: number;
  branchId: number | null;
  inmediatlyBossId: number | null;
  hireDate: string;
  maritalStatus: MaritalStatusEnum;
  baseSalary: number | null;
  positionStartDate: string | null;
  name: string | null;
  lastname: string | null;
  birthDate: string | null;
  genderId: number;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  positionId?: number | null;
  scheduleId?: number | null;
  area?: LookupReferenceDto | null;
  entity?: LookupReferenceDto | null;
  branch?: LookupReferenceDto | null;
}

export interface CreateEmployeeRequestDTO {
  fileNumber: string;
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
  genderId: number;
  maritalStatus: MaritalStatusEnum;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface UpdateEmployeeRequestDTO extends CreateEmployeeRequestDTO {}

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
  startDate: string;
  endDate?: string | null;
}

export interface EmployeeWrapperDto {
  employee: EmployeeResponseDto;
}

export interface ListEmployeesWrapperDto {
  employees: EmployeeResponseDto[];
  pagination: PaginationType | null;
}

export interface EmployeePositionHistoryResponseDto {
  id: number;
  employeeId: number;
  positionId: number;
  positionName: string | null;
  scheduleId: number;
  scheduleName: string | null;
  basicSalary: number;
  startDate: string;
  endDate: string | null;
}

export interface EmployeePositionHistoryWrapperDto {
  history: EmployeePositionHistoryResponseDto;
}

export interface ListEmployeePositionHistoriesWrapperDto {
  histories: EmployeePositionHistoryResponseDto[] | null;
}

export interface EmployeeRelationResponseDto {
  id: number;
  employeeId: number;
  relationType: RelationTypeEnum;
  name: string | null;
  lastname: string | null;
  documentNumber: string | null;
  birthDate: string;
  startDate: string;
  endDate: string | null;
}

export interface EmployeeRelationWrapperDto {
  relation: EmployeeRelationResponseDto;
}

export interface ListEmployeeRelationsWrapperDto {
  relations: EmployeeRelationResponseDto[] | null;
  pagination: PaginationType | null;
}