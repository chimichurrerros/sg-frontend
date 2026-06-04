import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerQuotesApi, type CustomerQuotesParams, type CreateCustomerQuoteRequest } from '@/api/customer-quotes.api';
import { toaster } from '@/components/ui/toaster';

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
             const body = (error as any).response?.data;
            const msg = body.detail
            toaster.create({
                title: 'Error al crear presupuesto',
                description: msg?msg: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
                type: 'error',
            });
        },

    });
};

export const useUpdateCustomerQuote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateCustomerQuoteRequest> }) =>
            customerQuotesApi.update(id, data),
        onSuccess: (_, variables) => {
            toaster.create({
                title: 'Presupuesto actualizado',
                description: `El presupuesto ha sido actualizado exitosamente.`,
                type: 'success',
            });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.lists() });
        },
        onError: (error) => {
            const body = (error as any).response?.data;
            const msg = body.detail
            toaster.create({
                title: 'Error al actualizar presupuesto',
                description: msg?msg: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
                type: 'error',
            });
        },
    });
};

export const useSellCustomerQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => customerQuotesApi.sell(id),
        onSuccess: (_, id) => {
            toaster.create({
                title: 'Presupuesto vendido',
                description: `El presupuesto ha sido aprobado exitosamente.`,
                type: 'success',
            });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.lists() });
        },
        onError: (error) => {
              const body = (error as any).response?.data;
            const msg = body.detail
            toaster.create({
                title: 'Error al aprobar presupuesto',
                description: msg?msg: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
                type: 'error',
            });
        },
    });
};

export const useRejectCustomerQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => customerQuotesApi.reject(id),
        onSuccess: (_, id) => {
            toaster.create({
                title: 'Presupuesto rechazado',
                description: `El presupuesto ha sido rechazado exitosamente.`,
                type: 'success',
            });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: customerQuoteKeys.lists() });
        },
        onError: (error) => {
            const body = (error as any).response?.data;
            const msg = body.detail
            toaster.create({
                title: 'Error al rechazar presupuesto',
                description: msg?msg: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
                type: 'error',
            });
        },
    });
};