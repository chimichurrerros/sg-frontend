import { salesReturnApi, type SaleReturnParams, type SaleReturnRequest } from "@/api/returns.api";
import { toaster } from "@/components/ui/toaster";
import { RETRIES } from "@/constants/queryConstants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const salesReturnKeys = {
    salesReturns: ["salesReturns"] as const,
};

export const useGetSalesReturns = (params: SaleReturnParams) => {
    return useQuery({
        queryKey: [...salesReturnKeys.salesReturns, params],
        queryFn: () => salesReturnApi.get(params),
        retry: RETRIES,
    });
};

export const useGetSalesReturnById = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: [...salesReturnKeys.salesReturns, id],
        queryFn: () => salesReturnApi.getById(id),
        retry: RETRIES,
        enabled: enabled && !!id && !isNaN(id),
    });
};

export const useGetAllSalesReturns = () => {
    return useQuery({
        queryKey: [...salesReturnKeys.salesReturns, "all"],
        queryFn: () => salesReturnApi.getAll(),
        retry: RETRIES,
    });
};

export const useCreateSalesReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SaleReturnRequest) => salesReturnApi.create(data),
        onSuccess: () => {
            toaster.create({ title: "Devolución registrada exitosamente", type: "success" });
            queryClient.invalidateQueries({ queryKey: salesReturnKeys.salesReturns });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({ title: "Error al registrar la devolución: " + errorMessage, type: "error" });
        },
        retry: RETRIES,
    });
};