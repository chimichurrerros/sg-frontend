import type { PaginationType } from "./types";

export interface AccountantProcess {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface AccountantProcessesGetResponse {
  accountantProcesses: AccountantProcess[];
  pagination: PaginationType | null;
}
