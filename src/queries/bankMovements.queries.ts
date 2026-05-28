import { useMutation, useQuery } from "@tanstack/react-query";
import {
  bankMovementsApi,
  type BankMovementResponseDto,
  type BankMovementRequestDto,
  type ListBankMovementsWrapperDto,
} from "@/api/bankMovements.api";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";

export const bankMovementsKeys = {
  all: ["bankMovements"] as const,
  detail: (id: number) => ["bankMovements", id] as const,
};

export const useGetMovements = (params?: PaginationParams) => {
  return useQuery<ListBankMovementsWrapperDto>({
    queryKey: ["bankMovements", params?.page, params?.pageSize],
    queryFn: () => bankMovementsApi.getMovements(params),
    retry: RETRIES,
  });
};

export const useGetMovementById = (id: number) => {
  return useQuery<BankMovementResponseDto>({
    queryKey: bankMovementsKeys.detail(id),
    queryFn: () => bankMovementsApi.getMovementById(id),
    retry: RETRIES,
    enabled: id >= 0,
  });
};

export const useCreateMovement = () => {
  return useMutation({
    mutationFn: (body: BankMovementRequestDto) =>
      bankMovementsApi.createMovement(body),
    retry: RETRIES,
  });
};


