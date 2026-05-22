import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    banksApi,
    type BankResponseDto,
    type CreateBankRequestDto,
    type ListBanksWrapperDto,
} from "@/api/banks.api";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";

export const bankKeys = {
    all: ["banks"] as const,
    detail: (id: number) => ["banks", id] as const,
};

export const useGetBanks = (params?: PaginationParams) => {
    return useQuery<ListBanksWrapperDto>({
        queryKey: ["banks", params?.page, params?.pageSize],
        queryFn: () => banksApi.getBanks(params),
        retry: RETRIES,
    });
};

export const useGetBankById = (id: number) => {
    return useQuery<BankResponseDto>({
        queryKey: bankKeys.detail(id),
        queryFn: () => banksApi.getBankById(id),
        retry: RETRIES,
        enabled: id >= 0,
    });
};

export const useCreateBank = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateBankRequestDto) => banksApi.createBank(body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Banco creado",
                description: "El banco ha sido creado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al crear el banco",
                description: "Ha ocurrido un error al intentar crear el banco: " + errorMessage,
                type: "error",
            });
        },
    });
};

export const useUpdateBank = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateBankRequestDto) => banksApi.updateBank(id, body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Banco actualizado",
                description: "El banco ha sido actualizado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankKeys.all });
            queryClient.invalidateQueries({ queryKey: bankKeys.detail(id) });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al actualizar el banco",
                description: "Ha ocurrido un error al intentar actualizar el banco: " + errorMessage,
                type: "error",
            });
        },
    });
};

export const useDeleteBank = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => banksApi.deleteBank(id),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Banco eliminado",
                description: "El banco ha sido eliminado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al eliminar el banco",
                description: "Ha ocurrido un error al intentar eliminar el banco: " + errorMessage,
                type: "error",
            });
        },
    });
};
