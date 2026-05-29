import { apiClient } from "@/api/client";

export interface CreateManualConceptRequestDto {
  employeeId: number;
  payrollUpdateId: number;
  amount: number;
  occurrenceDate: string; // YYYY-MM-DD
}

export interface ManualConceptResponseDto {
  id: number;
  employeeId: number;
  employeeFullName?: string;
  payrollUpdateId: number;
  conceptName?: string;
  payrollTypeName?: string;
  occurrenceDate: string;
  amount: number;
  statusName?: string;
  payrollProcessId?: number | null;
}

export const manualConceptsApi = {
  createManualConcept: (body: CreateManualConceptRequestDto) => apiClient.post<ManualConceptResponseDto>(`/api/manual-concepts`, body),
  getPendingManualConcepts: () => apiClient.get<ManualConceptResponseDto[]>(`/api/manual-concepts/pending`),
};

export default manualConceptsApi;
