import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface BankAccountResponseDto {
    id: number;
    name: string | null;
    currentBalance: number;
    availableBalance: number;
    accountType?: string | number | null;
    accountNumber?: string | null;
    isActive?: boolean;
}

export interface BankResponseDto {
    id: number;
    name: string | null;
    ruc: string | null;
    isActive: boolean;
    accounts: BankAccountResponseDto[] | null;
}

export interface ListBanksWrapperDto {
    banks: BankResponseDto[] | null;
    pagination: PaginationType;
}

export interface CreateBankRequestDto {
    name: string | null;
    ruc: string | null;
}

export const banksApi = {
    getBanks: (params?: PaginationParams) =>
        apiClient.get<ListBanksWrapperDto>("/api/banks", { params }).then((r) => r.data),

    createBank: (body: CreateBankRequestDto) =>
        apiClient.post<BankResponseDto>("/api/banks", body).then((r) => r.data),

    getBankById: (id: number) =>
        apiClient.get<{ bank: BankResponseDto }>(`/api/banks/${id}`).then((r) => r.data.bank),

    updateBank: (id: number, body: CreateBankRequestDto) =>
        apiClient.put<BankResponseDto>(`/api/banks/${id}`, body).then((r) => r.data),

    deleteBank: (id: number) =>
        apiClient.delete(`/api/banks/${id}`).then((r) => r.data),

    getAllBanks: () =>
        apiClient.get<{ banks: BankResponseDto[] }>("/api/banks/all").then((r) => r.data),
};
