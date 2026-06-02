import { apiClient } from "./client";

export interface PayrollProcessResponseDto {
  id: number;
  name: string;
  processTypeId: number;
  processTypeName: string;
  year: number;
  month: number;
  startDate: string;
  payDate?: string | null;
  payrollStatusId: number;
  payrollStatusName: string;
}

export interface PayrollProcessCreateDto {
  name: string;
  processTypeId: number;
  year: number;
  month: number;
  startDate: string;
  payDate?: string | null;
  payrollStatusId?: number | null;
}

export type PayrollProcessUpdateDto = PayrollProcessCreateDto;

export interface PayrollManualInputDto {
  employeeId: number;
  payrollUpdateId: number;
  amount: number;
}

export interface PayrollManualDetailResponseDto {
  id: number;
  employeeId: number;
  employeeFullName: string;
  conceptName: string;
  payrollTypeName: string;
  amount: number;
}

export interface UpdatePayrollProcessStatusRequestDto {
  payrollStatusId: number;
}

export interface PayrollProcessCalculationResponseDto {
  payrollProcessId: number;
  payrollProcessName: string;
  employeesProcessed: number;
  totalHaberes: number;
  totalDescuentos: number;
  totalNeto: number;
  employees: Array<any>;
}

export interface ReceiptConceptDto {
  conceptName: string;
  amount: number;
  isIpsDeductible: boolean;
}

export interface PayrollEmployeeReceiptDto {
  companyBusinessName: string;
  companyCuit: string;
  companyAddress: string;
  companyPhone: string;
  branchName: string;
  branchAddress: string;
  employeeName: string;
  employeeDocument: string;
  employeeLegajo: string;
  positionName: string;
  period: string;
  payDate: string;
  earnings: ReceiptConceptDto[];
  deductions: ReceiptConceptDto[];
  totalEarnings: number;
  totalDeductions: number;
  totalIpsDeductible: number;
  netSalary: number;
}

export const payrollProcessesApi = {
  getPayrollProcesses: () =>
    apiClient.get<PayrollProcessResponseDto[]>(`/api/payroll-processes`).then((response) => response.data),
  getPayrollProcess: (id: number) =>
    apiClient.get<PayrollProcessResponseDto>(`/api/payroll-processes/${id}`).then((response) => response.data),
  createPayrollProcess: (body: PayrollProcessCreateDto) =>
    apiClient.post<PayrollProcessResponseDto>(`/api/payroll-processes`, body).then((response) => response.data),
  updatePayrollProcess: (id: number, body: PayrollProcessUpdateDto) =>
    apiClient.put(`/api/payroll-processes/${id}`, body).then((response) => response.data),
  deletePayrollProcess: (id: number) =>
    apiClient.delete(`/api/payroll-processes/${id}`).then((response) => response.data),
  updatePayrollProcessStatus: (processId: number, body: UpdatePayrollProcessStatusRequestDto) =>
    apiClient.patch(`/api/payroll-processes/${processId}/status`, body).then((response) => response.data),
  getManualDetails: (processId: number) =>
    apiClient.get<PayrollManualDetailResponseDto[]>(`/api/payroll-processes/${processId}/manual-details`).then((response) => response.data),
  upsertManualDetail: (processId: number, body: PayrollManualInputDto) =>
    apiClient.post<PayrollManualDetailResponseDto>(`/api/payroll-processes/${processId}/manual-details`, body).then((response) => response.data),
  deleteManualDetail: (id: number) =>
    apiClient.delete(`/api/payroll-processes/manual-details/${id}`).then((response) => response.data),
  calculateProcess: (id: number) =>
    apiClient.post<PayrollProcessCalculationResponseDto>(`/api/payroll-processes/${id}/calculate`).then((response) => response.data),
  closeAndPayProcess: (id: number) =>
    apiClient.post<any>(`/api/payroll-processes/${id}/close-and-pay`).then((response) => response.data),
  getEmployeeReceipt: (processId: number, employeeId: number) =>
    apiClient.get<PayrollEmployeeReceiptDto>(`/api/payroll-processes/${processId}/receipt/${employeeId}`).then((response) => response.data),
  getPayrollUpdates: () =>
    apiClient.get(`/api/payroll-updates`).then((response) => response.data),
  createPayrollUpdate: (body: any) =>
    apiClient.post(`/api/payroll-updates`, body).then((response) => response.data),
  createManualConceptIncident: (body: any) =>
    apiClient.post(`/api/manual-concepts`, body).then((response) => response.data),
  getPendingManualConcepts: () =>
    apiClient.get(`/api/manual-concepts/pending`).then((response) => response.data),
};