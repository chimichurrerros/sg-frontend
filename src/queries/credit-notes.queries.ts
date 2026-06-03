// credit-notes.queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { RETRIES } from "@/constants/queryConstants";
import { creditNotesApi, type CreateCreditNoteRequest, type GetCreditNoteParams } from "@/api/credit-notes-api";

export const creditNoteKeys = {
    all: ["credit-notes"] as const,
    lists: () => [...creditNoteKeys.all, "list"] as const,
    list: (params: GetCreditNoteParams) => [...creditNoteKeys.lists(), params] as const,
    details: () => [...creditNoteKeys.all, "detail"] as const,
    detail: (id: number) => [...creditNoteKeys.details(), id] as const,
};

export const useGetCreditNotes = (params: GetCreditNoteParams) => {
    return useQuery({
        queryKey: creditNoteKeys.list(params),
        queryFn: () => creditNotesApi.get(params),
        retry: RETRIES,
    });
};

export const useGetCreditNoteById = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: creditNoteKeys.detail(id),
        queryFn: () => creditNotesApi.getById(id),
        retry: RETRIES,
        enabled: enabled && !!id && !isNaN(id),
    });
};

export const useCreateCreditNote = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateCreditNoteRequest) => creditNotesApi.create(data),
        onSuccess: () => {
            toaster.create({
                title: "Nota de crédito creada exitosamente",
                type: "success",
            });
            queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message || "Error desconocido";
            toaster.create({
                title: "Error al crear la nota de crédito",
                description: errorMessage,
                type: "error",
            });
        },
        retry: RETRIES,
    });
};

