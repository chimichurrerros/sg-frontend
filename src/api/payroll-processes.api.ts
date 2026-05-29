import { apiClient } from "./client";

export interface PayrollProcessResponseDto {
  id: number;
  name?: string | null;
  status?: string | null;
  statusName?: string | null;
  state?: string | null;
  stateName?: string | null;
  isOpen?: boolean | null;
}

export interface PayrollProcessManualDetailResponseDto {
  id: number;
  employeeId: number;
  employeeFullName: string;
  payrollUpdateId?: number | null;
  conceptName: string;
  payrollTypeName: string;
  amount: number;
}

export interface UpsertPayrollProcessManualDetailRequestDto {
  employeeId: number;
  payrollUpdateId: number;
  amount: number;
}

export interface PayrollProcessCalculationSummaryDto {
  message?: string | null;
  summary?: string | null;
  totalEmployees?: number | null;
  totalManualDetails?: number | null;
  totalConcepts?: number | null;
  details?: Array<{
    employeeId?: number | null;
    employeeFullName?: string | null;
    message?: string | null;
    [key: string]: unknown;
  }> | null;
  [key: string]: unknown;
}

export const payrollProcessesApi = {
  getPayrollProcess: (id: number) =>
    apiClient.get<PayrollProcessResponseDto>(`/api/payroll-processes/${id}`).then((response) => response.data),
  getManualDetails: (processId: number) =>
    apiClient
      .get<PayrollProcessManualDetailResponseDto[]>(`/api/payroll-processes/${processId}/manual-details`)
      .then((response) => response.data),
  upsertManualDetail: (processId: number, body: UpsertPayrollProcessManualDetailRequestDto) =>
    apiClient
      .post<PayrollProcessManualDetailResponseDto>(`/api/payroll-processes/${processId}/manual-details`, body)
      .then((response) => response.data),
  deleteManualDetail: (id: number) =>
    apiClient.delete(`/api/payroll-processes/manual-details/${id}`).then((response) => response.data),
  calculateProcess: (id: number) =>
    apiClient
      .post<PayrollProcessCalculationSummaryDto>(`/api/payroll-processes/${id}/calculate`)
      .then((response) => response.data),
};