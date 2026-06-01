import { apiClient } from "./client";
import type { LibroDiarioResponse, LibroMayorResponse, BalanceGeneralResponse, BalanceSumasSaldosResponse } from "@/types/accounting";

export interface GetLibroDiarioParams {
  accountantProcessId: number;
  startDate: string;
  endDate: string;
}

export interface GetLibroMayorParams {
  accountantProcessId: number;
  accountPlanId: number;
  startDate: string;
  endDate: string;
}

export interface GetBalanceGeneralParams {
  accountantProcessId: number;
  endDate: string;
}

export interface GetBalanceSumasSaldosParams {
  accountantProcessId: number;
  startDate: string;
  endDate: string;
}

export const accountingApi = {
  getLibroDiario: (params: GetLibroDiarioParams) =>
    apiClient
      .get<LibroDiarioResponse>("/api/accounting/reports/libro-diario", { params })
      .then((r) => r.data),
  getLibroMayor: (params: GetLibroMayorParams) =>
    apiClient
      .get<LibroMayorResponse>("/api/accounting/reports/libro-mayor", { params })
      .then((r) => r.data),
  getBalanceGeneral: (params: GetBalanceGeneralParams) =>
    apiClient
      .get<BalanceGeneralResponse>("/api/accounting/reports/balance-general", { params })
      .then((r) => r.data),
  getBalanceSumasSaldos: (params: GetBalanceSumasSaldosParams) =>
    apiClient
      .get<BalanceSumasSaldosResponse>("/api/accounting/reports/balance-sumas-saldos", { params })
      .then((r) => r.data),
};


