import { apiClient } from "./client";
import type { AccountantProcessesGetResponse } from "@/types/accountantProcesses";

export const accountantProcessesApi = {
  getAll: () => apiClient.get<AccountantProcessesGetResponse>("/api/accountant-processes/all").then((r) => r.data),
  create: (data: { name: string; startDate: string; endDate: string; isClosed?: boolean }) =>
    apiClient.post("/api/accountant-processes", data).then((r) => r.data),
  update: (id: number, data: { name: string; isClosed: boolean }) =>
    apiClient.put(`/api/accountant-processes/${id}`, data).then((r) => r.data),
};
