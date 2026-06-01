import { useQuery } from "@tanstack/react-query";
import { accountingApi, type GetLibroDiarioParams, type GetLibroMayorParams } from "@/api/accounting.api";

export const accountingKeys = {
  libroDiario: (params: GetLibroDiarioParams) =>
    ["accounting", "libroDiario", params] as const,
  libroMayor: (params: GetLibroMayorParams) =>
    ["accounting", "libroMayor", params] as const,
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

export const useLibroMayor = (params: GetLibroMayorParams, enabled = true) => {
  return useQuery({
    queryKey: accountingKeys.libroMayor(params),
    queryFn: () => accountingApi.getLibroMayor(params),
    retry: RETRIES,
    enabled: enabled && !!params.accountantProcessId && !!params.accountPlanId && !!params.startDate && !!params.endDate,
  });
};

