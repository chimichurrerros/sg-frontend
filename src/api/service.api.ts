import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface ServiceResponseDto {
    id: number;
    name: string;
    description: string;
    price: number;
    cost: number;
}

export interface ServicesGetResponse {
    services: ServiceResponseDto[];
    pagination: PaginationType | null;
}

export interface ServiceRequestDto {
    name?: string | null;
    description?: string | null;
    price: number;
    cost: number;
}

export interface ServiceWrapperDto {
    service: ServiceResponseDto;
}

export const servicesApi = {
    getAll: () => apiClient.get<ServicesGetResponse>("/api/services/all").then((r) => r.data),
    getById: (id: number) =>
        apiClient.get<ServiceWrapperDto>(`/api/services/${id}`).then((r) => r.data),
    create: (data: ServiceRequestDto) =>
        apiClient.post<ServiceWrapperDto>("/api/services", data).then((r) => r.data),
    update: (id: number, data: ServiceRequestDto) =>
        apiClient.put<ServiceWrapperDto>(`/api/services/${id}`, data).then((r) => r.data),
    delete: (id: number) =>
        apiClient.delete(`/api/services/${id}`).then((r) => r.data),
};
