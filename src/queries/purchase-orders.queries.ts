import {
    purchaseOrdersApi,
    type CreatePurchaseOrderDTO,
    type EditPurchaseOrderDTO,
} from "@/api/purchase-orders.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const purchaseOrdersKeys = {
    purchaseOrders: ["purchaseOrders"] as const,
    purchaseOrder: (id: number) => ["purchaseOrder", id] as const,
};

export const useAllPurchaseOrders = () => {
    return useQuery({
        queryKey: purchaseOrdersKeys.purchaseOrders,
        queryFn: purchaseOrdersApi.getAll,
    });
};

export const useGetPurchaseOrder = (id?: number) => {
    return useQuery({
        queryKey: id ? purchaseOrdersKeys.purchaseOrder(id) : ["purchaseOrder", "none"] as const,
        queryFn: () => purchaseOrdersApi.getById(id ?? 0),
        enabled: Boolean(id),
    });
};

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePurchaseOrderDTO) => purchaseOrdersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.purchaseOrders });
        },
    });
};

export const useEditPurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EditPurchaseOrderDTO }) =>
            purchaseOrdersApi.edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.purchaseOrders });
        },
    });
};