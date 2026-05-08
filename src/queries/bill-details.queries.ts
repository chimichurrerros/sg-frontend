import {
  billDetailsApi,
  type BillDetailsGetResponse,
  type CreateBillDetailRequest,
  type UpdateBillDetailRequest,
} from "@/api/bill-details.api";
import type { PaginationParams } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const billDetailsKeys = {
  billDetails: (billId: number) => ["billDetails", billId] as const,
  billDetail: (id: number) => ["billDetail", id] as const,
};

const RETRIES = 2;

export const useBillDetailsByBillId = (
  billId: number,
  params?: PaginationParams,
) => {
  return useQuery<BillDetailsGetResponse>({
    queryKey: ["billDetails", billId, params?.page, params?.pageSize],
    queryFn: () => billDetailsApi.getByBillId(billId),
    retry: RETRIES,
    enabled: billId > 0,
  });
};

export const useBillDetailById = (id: number) => {
  return useQuery({
    queryKey: billDetailsKeys.billDetail(id),
    queryFn: () => billDetailsApi.getById(id),
    retry: RETRIES,
  });
};

export const useCreateBillDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBillDetailRequest) => billDetailsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billDetailsKeys.billDetails(variables.billId),
      });
    },
    retry: RETRIES,
  });
};

export const useEditBillDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBillDetailRequest }) =>
      billDetailsApi.edit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billDetails"] });
    },
    retry: RETRIES,
  });
};
