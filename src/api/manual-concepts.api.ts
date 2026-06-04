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

export type ManualConceptIncidentCreateDto = CreateManualConceptRequestDto;

export interface ManualConceptIncidentResponseDto {
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
  createManualConcept: (body: ManualConceptIncidentCreateDto) =>
    apiClient.post<ManualConceptIncidentResponseDto>("/api/manual-concepts", body),
  getPendingManualConcepts: () =>
    apiClient.get<ManualConceptIncidentResponseDto[]>("/api/manual-concepts/pending"),
  updateManualConcept: (id: number, body: ManualConceptIncidentCreateDto) =>
    apiClient.put<ManualConceptIncidentResponseDto>(`/api/manual-concepts/${id}`, body),
  deleteManualConcept: (id: number) =>
    apiClient.delete(`/api/manual-concepts/${id}`),
};

export default manualConceptsApi;
