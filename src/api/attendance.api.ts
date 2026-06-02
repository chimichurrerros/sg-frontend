import { apiClient } from "./client";

export interface CreateAttendanceRequestDto {
  employeeId: number;
  date: string;
  status: number;
}

export interface AttendanceResponseDto {
  id: number;
  employeeId: number;
  employeeFullName: string;
  date: string;
  status: number;
  statusName: string;
}

export const attendanceApi = {
  create: (body: CreateAttendanceRequestDto) =>
    apiClient.post<AttendanceResponseDto>("/api/attendance", body).then((res) => res.data),
  getList: (params: { fromDate?: string; toDate?: string; employeeId?: number; year?: number; month?: number }) =>
    apiClient
      .get<AttendanceResponseDto[]>("/api/attendance", { params })
      .then((res) => res.data),
};
