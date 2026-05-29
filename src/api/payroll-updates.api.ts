import { apiClient } from "./client";
import type { PaginationType } from "@/types/types";

export interface PayrollTypeResponseDto {
  id: number;
  name: string;
}

export interface FormulaTypeResponseDto {
  id: number;
  name: string;
}

export interface PayrollUpdateResponseDto {
  id: number;
  name: string;
  payrollTypeId: number;
  payrollType: PayrollTypeResponseDto | null;
  formulaTypeId: number;
  formulaType: FormulaTypeResponseDto | null;
  formula: string;
  ipsDeductible: boolean;
}

export interface PayrollUpdateListResponseDto {
  payrollUpdates: PayrollUpdateResponseDto[];
  pagination: PaginationType | null;
}

export interface CreatePayrollUpdateRequestDto {
  name: string;
  payrollTypeId: number;
  formulaTypeId: number;
  formula: string;
  ipsDeductible: boolean;
}

export const payrollUpdatesApi = {
  getPayrollUpdates: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient
      .get<PayrollUpdateListResponseDto>("/api/payroll-updates", { params })
      .then((response) => response.data),
  createPayrollUpdate: (body: CreatePayrollUpdateRequestDto) =>
    apiClient
      .post<PayrollUpdateResponseDto>("/api/payroll-updates", body)
      .then((response) => response.data),
};