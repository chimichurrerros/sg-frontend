import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerQuotesApi, type CustomerQuotesParams, type CreateCustomerQuoteRequest } from '@/api/customer-quotes.api';
import { toaster } from '@/components/ui/toaster';
import { paymentMethodIds, paymentMethods, saleConditionIds } from './sales.queries';

export const customerQuoteKeys = {
    all: ['customer-quotes'] as const,
    lists: () => [...customerQuoteKeys.all, 'list'] as const,
    list: (params: CustomerQuotesParams) => [...customerQuoteKeys.lists(), params] as const,
    details: () => [...customerQuoteKeys.all, 'detail'] as const,
    detail: (id: number) => [...customerQuoteKeys.details(), id] as const,
};

export const useCustomerQuotes = (params: CustomerQuotesParams) => {
    return useQuery({
        queryKey: customerQuoteKeys.list(params),
        queryFn: () => customerQuotesApi.get(params),
    });
};

export const useCustomerQuoteById = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: customerQuoteKeys.detail(id),
        queryFn: () => customerQuotesApi.getById(id),
        enabled: enabled && !!id,
    });
};

export const useCreateCustomerQuote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerQuoteRequest) => customerQuotesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.lists() });
            toaster.create({
                title: 'Presupuesto creado',
                description: `El presupuesto ha sido creado exitosamente.`,
                type: 'success',
            });
        },
        onError: (error) => {
            toaster.create({
                title: 'Error al crear presupuesto',
                description: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
                type: 'error',
            });
            console.error('Error al crear presupuesto:', error);
        },

    });
};

export const useUpdateCustomerQuote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateCustomerQuoteRequest> }) =>
            customerQuotesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.lists() });
        },
        onError: (error) => {
            toaster.create({
                title: 'Error al actualizar presupuesto',
                description: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
                type: 'error',
            });
            console.error('Error al actualizar presupuesto:', error);
        },
    });
};