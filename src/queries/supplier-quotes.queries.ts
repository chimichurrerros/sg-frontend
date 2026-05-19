
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

export const useGetSupplierQuoteById = (id: number | undefined) => {
    return useQuery({
        queryKey: supplierQuoteKeys.detail(id ?? -1),
        queryFn: () => supplierQuoteApi.getById(id!),
        enabled: id !== undefined && id !== -1,
        staleTime: 0,
        refetchOnMount: true,
    });
};

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

export const useEditSupplierQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: {id: number,data: EditSupplierQuoteRequest}) => supplierQuoteApi.edit(body.id, body.data),
        onSuccess: () => {
            toaster.create({ title: "Cotización actualizada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: supplierQuoteKeys.all });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Error al editar la cotización: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};