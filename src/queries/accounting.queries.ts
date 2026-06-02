import { useQuery } from "@tanstack/react-query";
import {
  accountingApi,
  type GetLibroDiarioParams,
  type GetLibroMayorParams,
  type GetBalanceGeneralParams,
  type GetBalanceSumasSaldosParams,
  type GetBalanceResultadosParams,
} from "@/api/accounting.api";

export const accountingKeys = {
  libroDiario: (params: GetLibroDiarioParams) =>
    ["accounting", "libroDiario", params] as const,
  libroMayor: (params: GetLibroMayorParams) =>
    ["accounting", "libroMayor", params] as const,
  balanceGeneral: (params: GetBalanceGeneralParams) =>
    ["accounting", "balanceGeneral", params] as const,
  balanceSumasSaldos: (params: GetBalanceSumasSaldosParams) =>
    ["accounting", "balanceSumasSaldos", params] as const,
  balanceResultados: (params: GetBalanceResultadosParams) =>
    ["accounting", "balanceResultados", params] as const,
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

export const useBalanceGeneral = (params: GetBalanceGeneralParams, enabled = true) => {
  return useQuery({
    queryKey: accountingKeys.balanceGeneral(params),
    queryFn: () => accountingApi.getBalanceGeneral(params),
    retry: RETRIES,
    enabled: enabled && !!params.accountantProcessId && !!params.endDate,
  });
};

export const useBalanceSumasSaldos = (params: GetBalanceSumasSaldosParams, enabled = true) => {
  return useQuery({
    queryKey: accountingKeys.balanceSumasSaldos(params),
    queryFn: () => accountingApi.getBalanceSumasSaldos(params),
    retry: RETRIES,
    enabled: enabled && !!params.accountantProcessId && !!params.startDate && !!params.endDate,
  });
};

export const useBalanceResultados = (params: GetBalanceResultadosParams, enabled = true) => {
  return useQuery({
    queryKey: accountingKeys.balanceResultados(params),
    queryFn: () => accountingApi.getBalanceResultados(params),
    retry: RETRIES,
    enabled: enabled && !!params.accountantProcessId && !!params.startDate && !!params.endDate,
  });
};


