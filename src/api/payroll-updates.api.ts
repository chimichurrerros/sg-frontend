import { apiClient } from "./client";

export interface PayrollUpdateResponseDto {
  id: number;
  payrollTypeId: number;
  payrollTypeName: string;
  formulaTypeId: number;
  formulaTypeName: string;
  name: string;
  formula: string | null;
  ipsDeductible: boolean;
}

export interface CreatePayrollUpdateRequestDto {
  name: string;
  payrollTypeId: number;
  formulaTypeId: number;
  formula: string | null;
  ipsDeductible: boolean;
}

export type UpdatePayrollUpdateRequestDto = CreatePayrollUpdateRequestDto;

export const payrollUpdatesApi = {
  getPayrollUpdates: () =>
    apiClient
      .get<PayrollUpdateResponseDto[]>("/api/payroll-updates")
      .then((response) => response.data),
  createPayrollUpdate: (body: CreatePayrollUpdateRequestDto) =>
    apiClient
      .post<PayrollUpdateResponseDto>("/api/payroll-updates", body)
      .then((response) => response.data),
  updatePayrollUpdate: (id: number, body: UpdatePayrollUpdateRequestDto) =>
    apiClient
      .put<PayrollUpdateResponseDto>(`/api/payroll-updates/${id}`, body)
      .then((response) => response.data),
};