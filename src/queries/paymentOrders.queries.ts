import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    paymentOrdersApi,
    type CreatePaymentOrderRequest,
    type PaymentOrderFilterParams,
} from "@/api/paymentOrders.api";
import { toaster } from "@/components/ui/toaster";
import { RETRIES } from "@/constants/queryConstants";

export const paymentOrdersKeys = {
    all: ["paymentOrders"] as const,
    detail: (id: number) => ["paymentOrder", id] as const,
};

export const useGetPaymentOrders = (params: PaymentOrderFilterParams) => {
    return useQuery({
        queryKey: [...paymentOrdersKeys.all, params],
        queryFn: () => paymentOrdersApi.get(params),
    });
};

export const useGetPaymentOrderById = (id: number) => {
    return useQuery({
        queryKey: paymentOrdersKeys.detail(id),
        queryFn: () => paymentOrdersApi.getById(id),
        enabled: !!id,
        retry: RETRIES,
    });
};

export const useCreatePaymentOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePaymentOrderRequest) => paymentOrdersApi.create(data),
        onSuccess: () => {
            toaster.create({ title: "Orden de pago creada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: paymentOrdersKeys.all });
        },
        onError: (error: Error) => {
            const axiosError = error as { response?: { data?: { title?: string } } };
            const errorMessage = axiosError.response?.data?.title || error.message;
            toaster.create({ title: "Error al crear la orden de pago: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};
