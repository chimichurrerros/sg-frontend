import { apiClient } from "./client";

export interface PayrollVariableResponseDto {
  code: string;
  name: string;
  description: string;
}

export const payrollVariablesApi = {
  getPayrollVariables: () =>
    apiClient
      .get<PayrollVariableResponseDto[]>("/api/payroll-variables")
      .then((response) => response.data),
};