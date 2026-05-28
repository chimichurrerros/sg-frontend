import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface AccountResponseDto {
    id: number;
    accountType: number;
    bankId: number | null;
    name: string | null;
    currentBalance: number;
    availableBalance: number;
    accountNumber: string | null;
}

export interface ListAccountsWrapperDto {
    accounts: AccountResponseDto[] | null;
    pagination: PaginationType;
}

export interface CreateAccountRequestDto {
    accountType: number;
    bankId?: number | null;
    name?: string | null;
    currentBalance: number;
    availableBalance: number;
    accountNumber?: string | null;
}

export const accountTypeMap: Record<number, string> = {
    0: "Corriente",
    1: "Ahorro",
    2: "Efectivo",
};

export const bankAccountsApi = {
    getAccounts: (params?: PaginationParams) =>
        apiClient.get<ListAccountsWrapperDto>("/api/accounts", { params }).then((r) => r.data),

    createAccount: (body: CreateAccountRequestDto) =>
        apiClient.post<AccountResponseDto>("/api/accounts", body).then((r) => r.data),

    getAccountById: (id: number) =>
        apiClient.get<{ account: AccountResponseDto }>(`/api/accounts/${id}`).then((r) => r.data.account),

    updateAccount: (id: number, body: CreateAccountRequestDto) =>
        apiClient.put<AccountResponseDto>(`/api/accounts/${id}`, body).then((r) => r.data),

    deleteAccount: (id: number) =>
        apiClient.delete(`/api/accounts/${id}`).then((r) => r.data),
};
