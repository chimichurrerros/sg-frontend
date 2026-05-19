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

export const servicesApi = {
    getAll: () => apiClient.get<ServicesGetResponse>("/api/services/all").then((r) => r.data),
};
