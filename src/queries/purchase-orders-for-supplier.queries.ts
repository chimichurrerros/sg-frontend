import { purchaseOrderForSupplierApi, type PurchaseOrderForSupplierFilterParams } from "@/api/purchaseOrderForSupplier.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { RETRIES } from "@/constants/queryConstants";

export const purchaseOrderForSupplierKeys = {
  all: ["purchaseOrdersForSupplier"] as const,
  detail: (id: number) => ["purchaseOrdersForSupplier", id] as const,
};

export const useGetPurchaseOrdersForSupplier = (params: PurchaseOrderForSupplierFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...purchaseOrderForSupplierKeys.all, params],
    queryFn: () => purchaseOrderForSupplierApi.getAll(params),
    enabled,
  });
};

export const useGetAllPurchaseOrdersForSupplier = () => {
  return useQuery({
    queryKey: [...purchaseOrderForSupplierKeys.all, "all"],
    queryFn: () => purchaseOrderForSupplierApi.getAllWithoutPagination(),
  });
};

export const useGetPurchaseOrderForSupplierById = (id: number) => {
  return useQuery({
    queryKey: purchaseOrderForSupplierKeys.detail(id),
    queryFn: () => purchaseOrderForSupplierApi.getById(id),
    enabled: id >= 0,
  });
};

export const useConfirmPurchaseOrderForSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrderForSupplierApi.updateState(id, 2),
    onSuccess: () => {
      toaster.create({ title: "Orden de compra confirmada exitosamente", type: "success" });
      queryClient.invalidateQueries({ queryKey: purchaseOrderForSupplierKeys.all });
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { title?: string } } };
      const errorMessage = axiosError.response?.data?.title || error.message;
      toaster.create({ title: "Error al confirmar: " + errorMessage, type: "error" });
    },
    retry: RETRIES,
  });
};
