import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    bankMovementsApi,
    type BankMovementResponseDto,
    type CreateBankMovementRequestDto,
    type ListBankMovementsWrapperDto,
} from "@/api/bankMovements.api";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";

export const bankMovementsKeys = {
    all: ["bankMovements"] as const,
    detail: (id: number) => ["bankMovements", id] as const,
};

export const useGetMovements = (params?: PaginationParams) => {
    return useQuery<ListBankMovementsWrapperDto>({
        queryKey: ["bankMovements", params?.page, params?.pageSize],
        queryFn: () => bankMovementsApi.getMovements(params),
        retry: RETRIES,
    });
};

export const useGetMovementById = (id: number) => {
    return useQuery<BankMovementResponseDto>({
        queryKey: bankMovementsKeys.detail(id),
        queryFn: () => bankMovementsApi.getMovementById(id),
        retry: RETRIES,
        enabled: !!id,
    });
};

export const useCreateMovement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateBankMovementRequestDto) => bankMovementsApi.createMovement(body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Movimiento creado",
                description: "El movimiento bancario ha sido creado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankMovementsKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al crear el movimiento",
                description: "Ha ocurrido un error al intentar crear el movimiento: " + errorMessage,
                type: "error",
            });
        },
    });
};

export const useUpdateMovement = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateBankMovementRequestDto) => bankMovementsApi.updateMovement(id, body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Movimiento actualizado",
                description: "El movimiento bancario ha sido actualizado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankMovementsKeys.all });
            queryClient.invalidateQueries({ queryKey: bankMovementsKeys.detail(id) });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al actualizar el movimiento",
                description: "Ha ocurrido un error al intentar actualizar el movimiento: " + errorMessage,
                type: "error",
            });
        },
    });
};

export const useDeleteMovement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => bankMovementsApi.deleteMovement(id),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Movimiento eliminado",
                description: "El movimiento bancario ha sido eliminado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: bankMovementsKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al eliminar el movimiento",
                description: "Ha ocurrido un error al intentar eliminar el movimiento: " + errorMessage,
                type: "error",
            });
        },
    });
};
