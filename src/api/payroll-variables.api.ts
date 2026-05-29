import { apiClient } from "./client";

export interface PayrollVariableResponseDto {
  id?: number;
  name: string;
  description?: string | null;
}

export const payrollVariablesApi = {
  getPayrollVariables: () =>
    apiClient
      .get<PayrollVariableResponseDto[]>("/api/payroll-variables")
      .then((response) => response.data),
};