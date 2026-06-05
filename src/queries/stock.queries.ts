import { stockApi, type CreateStockItemRequest, type EditStockItemRequest } from "@/api/stock.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const stockKeys = {
    stock: ["stock"] as const,
};

const RETRIES = 2;

export const useStock = (branchId?: number, search?: string) => {
    const hasParams = branchId != null || (search != null && search !== "");
    return useQuery({
        queryKey: hasParams ? [...stockKeys.stock, { branchId, search }] : stockKeys.stock,
        queryFn: () => stockApi.getAll(branchId, search),
        retry: RETRIES
    })
}

export const useCreateStockItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStockItemRequest) => stockApi.create(data),
        onSuccess: () => {queryClient.invalidateQueries({ queryKey: stockKeys.stock }); queryClient.refetchQueries({ queryKey: stockKeys.stock })},
        retry: RETRIES
    })
}

export const useEditStockItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EditStockItemRequest }) =>
            stockApi.edit(id, data),
        onSuccess: () => {
            {queryClient.invalidateQueries({ queryKey: stockKeys.stock }); queryClient.refetchQueries({ queryKey: stockKeys.stock })}
        },
        retry: RETRIES
    })
}

export const useDeleteStockItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => stockApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stockKeys.stock });
            queryClient.refetchQueries({ queryKey: stockKeys.stock });
        },
        retry: RETRIES
    })
}
