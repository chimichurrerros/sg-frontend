import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    bankAccountsApi,
    type AccountResponseDto,
    type CreateAccountRequestDto,
    type ListAccountsWrapperDto,
} from "@/api/bankAccounts.api";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";

export const bankAccountsKeys = {
    all: ["bankAccounts"] as const,
    detail: (id: number) => ["bankAccounts", id] as const,
};

export const useGetAccounts = (params?: PaginationParams) => {
    return useQuery<ListAccountsWrapperDto>({
        queryKey: ["bankAccounts", params?.page, params?.pageSize],
        queryFn: () => bankAccountsApi.getAccounts(params),
        retry: RETRIES,
    });
};

export const useGetAccountById = (id: number) => {
    return useQuery<AccountResponseDto>({
        queryKey: bankAccountsKeys.detail(id),
        queryFn: () => bankAccountsApi.getAccountById(id),
        retry: RETRIES,
        enabled: !!id,
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateAccountRequestDto) => bankAccountsApi.createAccount(body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Cuenta creada",
                description: "La cuenta bancaria ha sido creada exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankAccountsKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al crear la cuenta",
                description: "Ha ocurrido un error al intentar crear la cuenta: " + errorMessage,
                type: "error",
            });
        },
    });
};

export const useUpdateAccount = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateAccountRequestDto) => bankAccountsApi.updateAccount(id, body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Cuenta actualizada",
                description: "La cuenta bancaria ha sido actualizada exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankAccountsKeys.all });
            queryClient.invalidateQueries({ queryKey: bankAccountsKeys.detail(id) });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al actualizar la cuenta",
                description: "Ha ocurrido un error al intentar actualizar la cuenta: " + errorMessage,
                type: "error",
            });
        },
    });
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => bankAccountsApi.deleteAccount(id),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Cuenta eliminada",
                description: "La cuenta bancaria ha sido eliminada exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankAccountsKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al eliminar la cuenta",
                description: "Ha ocurrido un error al intentar eliminar la cuenta: " + errorMessage,
                type: "error",
            });
        },
    });
};
