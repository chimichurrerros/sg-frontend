import {
  billsApi,
  type CreateBillRequest,
  type UpdateBillRequest,
  type BillFilterParams,
} from "@/api/bills.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const billsKeys = {
  bills: (params?: BillFilterParams) => ["bills", params] as const,
  bill: (id: number) => ["bills", id] as const,
};

const RETRIES = 2;

export const useAllBills = (params?: BillFilterParams, enabled = true) => {
  return useQuery({
    queryKey: billsKeys.bills(params),
    queryFn: () => billsApi.getAll(params),
    retry: RETRIES,
    enabled,
  });
};

export const useBillById = (id: number, enabled?: boolean) => {
  return useQuery({
    queryKey: billsKeys.bill(id),
    queryFn: () => billsApi.getById(id),
    retry: RETRIES,
    enabled,
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBillRequest) => billsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
    retry: RETRIES,
  });
};

export const useEditBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBillRequest }) =>
      billsApi.edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
    retry: RETRIES,
  });
};
