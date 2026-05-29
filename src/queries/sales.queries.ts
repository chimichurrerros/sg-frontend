import { salesApi } from "@/api/sales.api";
import { toaster } from "@/components/ui/toaster";
import type { PaymentMethod, Sale, SaleCondition } from "@/types/sales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";

export const paymentMethods : Record<number,PaymentMethod> = {
    1: "Efectivo",
    2: "Tarjeta",
    3: "Transferencia"
}
export const saleConditions : Record<number,SaleCondition> = {
    1: "Contado",
    2: "Credito"
}
const payments = { "Efectivo": 1, "Tarjeta": 2, "Transferencia": 3 }
const conditions = { "Contado": 1, "Credito": 2 }

export const salesKeys = {
    sales: ["sales"] as const,
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Sale) =>
            salesApi.createSale({
                ...data,
                sale: { ...data.sale, date: new Date().toISOString().split('.')[0] },
                pay: {
                    method: payments[data.pay.method],
                    condition: conditions[data.pay.condition]
                },
                products: data.products.map((p) => {
                    return { productId: p.id, barcode: p.barcode, quantity: p.quantity }
                })
            }),
        onSuccess: () => {
            toaster.create({ title: "Venta registrada exitosamente", type: "success" })
            queryClient.invalidateQueries({ queryKey: salesKeys.sales })
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Ha ocurrido un error al intentar crear la venta: " + errorMessage, type: "error" })
        },
        retry: RETRIES
    });
};

export const useGetSales = (params: PaginationParams) => {
    return useQuery({
        queryKey: [...salesKeys.sales, params.page, params.pageSize],
        queryFn: () => salesApi.getSales(params),
        retry: RETRIES
    });
};

export const useGetSaleById = (id: number | undefined, enabled: boolean = true) => {
    return useQuery({
        queryKey: [...salesKeys.sales, id],
        queryFn: () => salesApi.getSaleById(id!),
        retry: RETRIES,
        enabled: enabled && !!id && !isNaN(id)
    });
};
export const useGetAllSales = () => {
    return useQuery({
        queryKey: [...salesKeys.sales, "all"],
        queryFn: () => salesApi.getAll(),
        retry: RETRIES
    });
};