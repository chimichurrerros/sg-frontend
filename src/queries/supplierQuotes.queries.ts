
import { supplierQuoteApi, type SupplierQuoteCreateRequest, type EditSupplierQuoteRequest } from "@/api/supplierQuote.api";
import { toaster } from "@/components/ui/toaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";


export const supplierQuoteKeys = {
    all: ["supplierQuotes"] as const,
    detail: (id: number) => ["supplierQuotes", id] as const,
};

export const useGetSupplierQuotes = (params: PaginationParams) => {
    return useQuery({
        queryKey: supplierQuoteKeys.detail(params.page || 1),
        queryFn: () => supplierQuoteApi.get(params),
        enabled: !!params.page,
    });
};

export const useGetAllSupplierQuotes = () => {
    return useQuery({
        queryKey: [...supplierQuoteKeys.all],
        queryFn: () => supplierQuoteApi.getAll(),
    });
};
export const useGetSupplierQuoteById = (id: number) => {
    return useQuery({
        queryKey: supplierQuoteKeys.detail(id),
        queryFn: () => supplierQuoteApi.getById(id),
        enabled: !!id,
    });
}

export const useCreateSupplierQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SupplierQuoteCreateRequest) => supplierQuoteApi.create(data),
        onSuccess: () => {
            toaster.create({ title: "Cotización creada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: supplierQuoteKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Error al crear la cotización: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};

export const useEditSupplierQuote = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EditSupplierQuoteRequest) => supplierQuoteApi.edit(id, data),
        onSuccess: () => {
            toaster.create({ title: "Cotización actualizada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: supplierQuoteKeys.all });
            queryClient.invalidateQueries({ queryKey: supplierQuoteKeys.detail(id) });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Error al editar la cotización: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};