import {
  billsApi,
  type CreateBillRequest,
  type UpdateBillRequest,
} from "@/api/bills.api";
import type { PaginationParams } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const billsKeys = {
  bills: (params?: PaginationParams) => ["bills", params] as const,
  bill: (id: number) => ["bills", id] as const,
};

const RETRIES = 2;

export const useAllBills = (params?: PaginationParams) => {
  return useQuery({
    queryKey: billsKeys.bills(params),
    queryFn: () => billsApi.getAll(params),
    retry: RETRIES,
  });
};

export const useBillById = (id: number) => {
  return useQuery({
    queryKey: billsKeys.bill(id),
    queryFn: () => billsApi.getById(id),
    retry: RETRIES,
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
