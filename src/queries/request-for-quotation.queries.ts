import { requestForQuotationApi, type RequestForQuotationFilterParams } from "@/api/requestForQuotation.api";
import { useQuery } from "@tanstack/react-query";

export const requestForQuotationKeys = {
  all: ["requestForQuotations"] as const,
  detail: (id: number) => ["requestForQuotations", id] as const,
  bySupplierAndPurchaseRequest: (supplierId: number, purchaseRequestId: number) =>
    ["requestForQuotations", "bySupplier", supplierId, "byPR", purchaseRequestId] as const,
};

export const useGetRequestForQuotations = (params: RequestForQuotationFilterParams) => {
  return useQuery({
    queryKey: [...requestForQuotationKeys.all, params],
    queryFn: () => requestForQuotationApi.getAll(params),
  });
};

export const useGetRequestForQuotationById = (id: number) => {
  return useQuery({
    queryKey: requestForQuotationKeys.detail(id),
    queryFn: () => requestForQuotationApi.getById(id),
    enabled: id >= 0,
  });
};

export const useGetRequestForQuotationBySupplierAndPR = (
  supplierId: number,
  purchaseRequestId: number,
) => {
  return useQuery({
    queryKey: requestForQuotationKeys.bySupplierAndPurchaseRequest(supplierId, purchaseRequestId),
    queryFn: () => requestForQuotationApi.getBySupplierAndPurchaseRequest(supplierId, purchaseRequestId),
    enabled: supplierId > 0 && purchaseRequestId > 0,
  });
};
