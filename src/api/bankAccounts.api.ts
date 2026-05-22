import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface AccountResponseDto {
    id: number;
    accountType: number;
    bankId: number | null;
    name: string | null;
    currentBalance: number;
    availableBalance: number;
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
}

export const accountTypeMap: Record<number, string> = {
    0: "Corriente",
    1: "Ahorro",
    2: "Efectivo",
};

export const bankAccountsApi = {
    getAccounts: (params?: PaginationParams) =>
        apiClient.get<ListAccountsWrapperDto>("/api/Accounts", { params }).then((r) => r.data),

    createAccount: (body: CreateAccountRequestDto) =>
        apiClient.post<AccountResponseDto>("/api/Accounts", body).then((r) => r.data),

    getAccountById: (id: number) =>
        apiClient.get<{ account: AccountResponseDto }>(`/api/Accounts/${id}`).then((r) => r.data.account),

    updateAccount: (id: number, body: CreateAccountRequestDto) =>
        apiClient.put<AccountResponseDto>(`/api/Accounts/${id}`, body).then((r) => r.data),

    deleteAccount: (id: number) =>
        apiClient.delete(`/api/Accounts/${id}`).then((r) => r.data),
};
