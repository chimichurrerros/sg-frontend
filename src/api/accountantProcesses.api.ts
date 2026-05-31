import { apiClient } from "./client";
import type { AccountantProcessesGetResponse } from "@/types/accountantProcesses";

export const accountantProcessesApi = {
  getAll: () => apiClient.get<AccountantProcessesGetResponse>("/api/accountant-processes/all").then((r) => r.data),
};
