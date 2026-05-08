import { useQuery } from "@tanstack/react-query";
import { checksApi, type GetCheckResponse} from "@/api/checks.api";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";
export const checksKeys = {
  checks: ["checks"] as const,
};
// export const useBillDetailsByBillId = (
//   billId: number,
//   params?: PaginationParams,
// ) => {
//   return useQuery<BillDetailsGetResponse>({
//     queryKey: ["billDetails", billId, params?.page, params?.pageSize],
//     queryFn: () => billDetailsApi.getByBillId(billId),
//     retry: RETRIES,
//     enabled: billId > 0,
//   });
export const useGetChecksKeys = (params?: PaginationParams) => {
  return useQuery<GetCheckResponse>({
    queryKey: ["checks",params?.page, params?.pageSize],
    queryFn: () => checksApi.getChecks(),
    retry: RETRIES
  })
}

// export const useCreateCheck = (body: CreateCheckBodyRequest) => {