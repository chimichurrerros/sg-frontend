import { useQuery } from "@tanstack/react-query";
import { accountingApi, type GetLibroDiarioParams } from "@/api/accounting.api";

export const accountingKeys = {
  libroDiario: (params: GetLibroDiarioParams) =>
    ["accounting", "libroDiario", params] as const,
};

const RETRIES = 2;

export const useLibroDiario = (params: GetLibroDiarioParams, enabled = true) => {
  return useQuery({
    queryKey: accountingKeys.libroDiario(params),
    queryFn: () => accountingApi.getLibroDiario(params),
    retry: RETRIES,
    enabled: enabled && !!params.accountantProcessId && !!params.startDate && !!params.endDate,
  });
};
