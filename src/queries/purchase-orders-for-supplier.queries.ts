import { purchaseOrderForSupplierApi, type PurchaseOrderForSupplierFilterParams } from "@/api/purchaseOrderForSupplier.api";
import { useQuery } from "@tanstack/react-query";

export const purchaseOrderForSupplierKeys = {
  all: ["purchaseOrdersForSupplier"] as const,
  detail: (id: number) => ["purchaseOrdersForSupplier", id] as const,
};

export const useGetPurchaseOrdersForSupplier = (params: PurchaseOrderForSupplierFilterParams) => {
  return useQuery({
    queryKey: [...purchaseOrderForSupplierKeys.all, params],
    queryFn: () => purchaseOrderForSupplierApi.getAll(params),
  });
};

export const useGetPurchaseOrderForSupplierById = (id: number) => {
  return useQuery({
    queryKey: purchaseOrderForSupplierKeys.detail(id),
    queryFn: () => purchaseOrderForSupplierApi.getById(id),
    enabled: id >= 0,
  });
};
