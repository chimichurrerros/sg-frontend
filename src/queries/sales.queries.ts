import { salesApi } from "@/api/sales.api";
import { toaster } from "@/components/ui/toaster";
import type { Sale } from "@/types/sales";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const payments = { "Efectivo": 1, "Tarjeta": 2, "Transferencia": 3 }
const conditions = { "Contado": 1, "Credito": 2 }
const RETRIES = 2
export const salesKeys = {
    sales: ["sales"] as const,
};
export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Sale) =>
            salesApi.createSale(
                {
                    ...data,
                    sale: { ...data.sale, date: new Date().toISOString().split('.')[0] },
                    pay: {
                        method: payments[data.pay.method],
                        condition: conditions[data.pay.condition]
                    },
                    products: data.products.map((p) => {
                        return { productId: p.id, barcode: p.barcode, quantity: p.quantity }
                    })
                })
        , onSuccess: () => {
            toaster.create({ title: "Venta registrada exitosamente", type: "success" })
            queryClient.invalidateQueries({ queryKey: salesKeys.sales })
        },
        onError: (error: any) => {
            // const errorBody = error.response?.data;
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Ha ocurrido un error al intentar crear la venta: " + errorMessage, type: "error" })
        },
        retry: RETRIES
    });
};
