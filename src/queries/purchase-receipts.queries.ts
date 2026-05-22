import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseReceiptsApi, type CreatePurchaseReceiptRequest } from "@/api/purchaseReceipts.api";
import { toaster } from "@/components/ui/toaster";
import { RETRIES } from "@/constants/queryConstants";

export const purchaseReceiptsKeys = {
    all: ["purchaseReceipts"] as const,
};

export const useCreatePurchaseReceipt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePurchaseReceiptRequest) => purchaseReceiptsApi.create(data),
        onSuccess: () => {
            toaster.create({ title: "Recepción creada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: purchaseReceiptsKeys.all });
        },
        onError: (error: Error) => {
            const axiosError = error as { response?: { data?: { title?: string } } };
            const errorMessage = axiosError.response?.data?.title || error.message;
            toaster.create({ title: "Error al crear la recepción: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};
