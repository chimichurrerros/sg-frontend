import { apiClient } from "./client";
import type { LibroDiarioResponse } from "@/types/accounting";

export interface GetLibroDiarioParams {
  accountantProcessId: number;
  startDate: string;
  endDate: string;
}

export const accountingApi = {
  getLibroDiario: (params: GetLibroDiarioParams) =>
    apiClient
      .get<LibroDiarioResponse>("/api/accounting/reports/libro-diario", { params })
      .then((r) => r.data),
};
