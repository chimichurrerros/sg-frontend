import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface BankMovementResponseDto {
    id: number;
    bankAccountId: number;
    amount: number;
    description: string | null;
    date: string;
}

export interface ListBankMovementsWrapperDto {
    bankMovements: BankMovementResponseDto[] | null;
    pagination: PaginationType;
}

export interface CreateBankMovementRequestDto {
    bankAccountId: number;
    amount: number;
    description?: string | null;
    date: string;
}

export const bankMovementsApi = {
    getMovements: (params?: PaginationParams) =>
        apiClient.get<ListBankMovementsWrapperDto>("/api/bank-movements", { params }).then((r) => r.data),

    createMovement: (body: CreateBankMovementRequestDto) =>
        apiClient.post<BankMovementResponseDto>("/api/bank-movements", body).then((r) => r.data),

    getMovementById: (id: number) =>
        apiClient.get<{ bankMovement: BankMovementResponseDto }>(`/api/bank-movements/${id}`).then((r) => r.data.bankMovement),

    updateMovement: (id: number, body: CreateBankMovementRequestDto) =>
        apiClient.put<BankMovementResponseDto>(`/api/bank-movements/${id}`, body).then((r) => r.data),

    deleteMovement: (id: number) =>
        apiClient.delete(`/api/bank-movements/${id}`).then((r) => r.data),
};
