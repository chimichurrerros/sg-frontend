import { apiClient } from "./client";
import type { LibroDiarioResponse, LibroMayorResponse } from "@/types/accounting";

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

export const accountingApi = {
  getLibroDiario: (params: GetLibroDiarioParams) =>
    apiClient
      .get<LibroDiarioResponse>("/api/accounting/reports/libro-diario", { params })
      .then((r) => r.data),
  getLibroMayor: (params: GetLibroMayorParams) =>
    apiClient
      .get<LibroMayorResponse>("/api/accounting/reports/libro-mayor", { params })
      .then((r) => r.data),
};

