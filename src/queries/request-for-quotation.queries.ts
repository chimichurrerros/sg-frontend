import { requestForQuotationApi, type RequestForQuotationFilterParams } from "@/api/requestForQuotation.api";
import { useQuery } from "@tanstack/react-query";

export const requestForQuotationKeys = {
  all: ["requestForQuotations"] as const,
  detail: (id: number) => ["requestForQuotations", id] as const,
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
