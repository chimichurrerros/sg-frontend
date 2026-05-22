import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export const checkStatusEnum:Record<number, string>  = { 
    0: "Pendiente",
    1: "Cobrado",
    2: "Anulado"}

export const checkTypeEnum:Record<number, string>  = { 
    0: "Día",
    1: "Diferido"
}
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
    getCheckById: (id: number) => apiClient.get<{check: Check}>(`/api/Checks/${id}`).then((r) => r.data.check),
    updateCheck: (id: number, body: UpdateCheckBodyRequest) => apiClient.patch<Check>(`/api/Checks/${id}/status`, body).then((r) => r.data)
}