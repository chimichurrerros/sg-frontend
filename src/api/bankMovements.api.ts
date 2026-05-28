import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export const movementTypeMap: Record<number, string> = {
    1: "Débito",
    2: "Crédito",
};

export interface CreateCheckRequestDto {
    accountId: number;
    number?: string | null;
    emisionDate: string;
    availabilityDate?: string | null;
    type: number;
    issuingBank?: string | null;
    receiver?: string | null;
    amount: number;
}

export interface BankMovementResponseDto {
    id: number;
    accountId: number;
    amount: number;
    description: string | null;
    date: string;
    movementType: number;
}

export interface ListBankMovementsWrapperDto {
    bankMovements: BankMovementResponseDto[] | null;
    pagination: PaginationType;
}

export interface BankMovementRequestDto {
    accountId: number;
    amount: number;
    description?: string | null;
    date: string;
    movementType: number;
    checkDetails?: CreateCheckRequestDto | null;
}

export const bankMovementsApi = {
    getMovements: (params?: PaginationParams) =>
        apiClient.get<ListBankMovementsWrapperDto>("/api/bank-movements", { params }).then((r) => r.data),

    createMovement: (body: BankMovementRequestDto) =>
        apiClient.post<BankMovementResponseDto>("/api/bank-movements", body).then((r) => r.data),

    getMovementById: (id: number) =>
        apiClient.get<{ bankMovement: BankMovementResponseDto }>(`/api/bank-movements/${id}`).then((r) => r.data.bankMovement),

};
