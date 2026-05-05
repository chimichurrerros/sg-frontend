import { stockApi, type CreateStockItemRequest, type EditStockItemRequest } from "@/api/stock.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const stockKeys = {
    stock: ["stock"] as const,
};

const RETRIES = 2;

export const useAllStock = () => {
    return useQuery({
        queryKey: stockKeys.stock,
        queryFn: stockApi.getAll,
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
