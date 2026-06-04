import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    purchaseReturnsApi,
    type CreatePurchaseReturnRequest,
    type PurchaseReturnFilterParams,
} from "@/api/purchaseReturns.api";
import { toaster } from "@/components/ui/toaster";
import { RETRIES } from "@/constants/queryConstants";

export const purchaseReturnsKeys = {
    all: ["purchaseReturns"] as const,
    detail: (id: number) => ["purchaseReturn", id] as const,
};

export const useGetPurchaseReturns = (params: PurchaseReturnFilterParams) => {
    return useQuery({
        queryKey: [...purchaseReturnsKeys.all, params],
        queryFn: () => purchaseReturnsApi.get(params),
    });
};

export const useGetPurchaseReturnById = (id?: number) => {
    return useQuery({
        queryKey: id ? purchaseReturnsKeys.detail(id) : ["purchaseReturn", "none"] as const,
        queryFn: () => purchaseReturnsApi.getById(id!),
        enabled: Boolean(id),
    });
};

export const useCreatePurchaseReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePurchaseReturnRequest) => purchaseReturnsApi.create(data),
        onSuccess: () => {
            toaster.create({ title: "Devolución creada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: purchaseReturnsKeys.all });
        },
        onError: (error: Error) => {
            const axiosError = error as { response?: { data?: { title?: string } } };
            const errorMessage = axiosError.response?.data?.title || error.message;
            toaster.create({ title: "Error al crear la devolución: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};
