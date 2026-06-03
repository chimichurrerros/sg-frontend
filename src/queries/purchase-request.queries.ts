import { purchaseRequestApi, type PurchaseRequestCreateRequest } from "@/api/purchaseRequest.api";
import { toaster } from "@/components/ui/toaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";


export const purchaseRequestKeys = {
    all: ["purchaseRequests"] as const,
    detail: (id: number) => ["purchaseRequests", id] as const,
};

export const useGetPurchaseRequests = (params: PaginationParams) => {
    return useQuery({
        queryKey: [...purchaseRequestKeys.all, params],
        queryFn: () => purchaseRequestApi.get(params),
    });
};

export const useGetAllPurchaseRequests = () => {
    return useQuery({
        queryKey: purchaseRequestKeys.all,
        queryFn: () => purchaseRequestApi.getAll(),
    });
};

export const useGetPurchaseRequestById = (id: number) => {
    return useQuery({
        queryKey: purchaseRequestKeys.detail(id),
        queryFn: () => purchaseRequestApi.getById(id),
        enabled: id >= 0,
    });
};

export const useCreatePurchaseRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PurchaseRequestCreateRequest) => purchaseRequestApi.create(data),
        onSuccess: () => {
            toaster.create({ title: "Solicitud de compra creada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Error al crear la solicitud de compra: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};

export const useEligibleSuppliers = (productIds: number[], enabled: boolean) =>
    useQuery({
        queryKey: ["eligibleSuppliers", productIds],
        queryFn: () => purchaseRequestApi.getEligibleSuppliers(productIds),
        enabled: enabled && productIds.length > 0,
        retry: RETRIES,
    });


