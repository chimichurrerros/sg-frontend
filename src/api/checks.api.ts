import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface GetCheckResponse {
    checks: Check[];
    pagination: PaginationType;
}
export interface Check {
    id:               number;
    number:           string;
    emisionDate:      string;
    availabilityDate: string;
    paymentDate:      string;
    maturityDate:     string;
    type:             number;
    issuingBank:      string;
    receiver:         string;
    amount:           number;
    status:           number;
}

export interface CreateCheckBodyRequest {
    number:           string;
    emisionDate:      string;
    availabilityDate: string;
    type:             number;
    issuingBank:      string;
    receiver:         string;
    amount:           number;
}
export interface UpdateCheckBodyRequest {
    status?:      number;
    paymentDate?: string;
}
export const checksApi = {
    getChecks:  (params?:PaginationParams) => apiClient.get<GetCheckResponse>("/api/Checks/", { params }).then((r) => r.data),
    createCheck: (body: CreateCheckBodyRequest) => apiClient.post<Check>("/api/Checks/",body).then((r) => r.data),
    getCheckById: (id: number) => apiClient.get<Check>(`/api/Checks/${id}`).then((r) => r.data),
    updateCheck: (id: number, body: UpdateCheckBodyRequest) => apiClient.patch<Check>(`/api/Checks/${id}/status`, body).then((r) => r.data)
}