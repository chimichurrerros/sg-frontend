import type { PaginationType } from "@/types/types";

export interface OrganizationQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "ASC" | "DESC";
}

export type PaginationRequestDto = OrganizationQueryDto;

export interface DepartmentRequestDto {
  name: string;
}

export interface DepartmentResponseDto {
  id: number;
  name: string | null;
}

export interface DepartmentWrapperDto {
  department: DepartmentResponseDto;
}

export interface ListDepartmentsWrapperDto {
  departments: DepartmentResponseDto[];
  pagination: PaginationType | null;
}

export interface PositionRequestDto {
  name: string;
  defaultBasicSalary: number;
  departmentId?: number | null;
}

export interface PositionResponseDto {
  id: number;
  name: string | null;
  defaultBasicSalary: number;
  departmentId: number | null;
  departmentName: string | null;
}

export interface PositionWrapperDto {
  position: PositionResponseDto;
}

export interface ListPositionsWrapperDto {
  positions: PositionResponseDto[];
  pagination: PaginationType | null;
}

export type ScheduleTypeEnum = 0 | 1 | 2 | 3 | 4 | 5;
export const ScheduleTypeEnum = {
  Unknown: 0,
  Morning: 1,
  Afternoon: 2,
  Night: 3,
  FullTime: 4,
  PartTime: 5,
} as const;

export interface ScheduleRequestDto {
  arrivalTime: string;
  departureTime: string;
  numberOfHours: number;
  scheduleType: ScheduleTypeEnum;
}

export interface ScheduleResponseDto {
  id: number;
  name: string | null;
  arrivalTime: string;
  departureTime: string;
  numberOfHours: number;
  scheduleType: ScheduleTypeEnum;
}

export interface ScheduleWrapperDto {
  schedule: ScheduleResponseDto;
}

export interface ListSchedulesWrapperDto {
  schedules: ScheduleResponseDto[];
  pagination: PaginationType | null;
}
