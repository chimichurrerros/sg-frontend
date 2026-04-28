import type { Bill } from "@/types/bills";
import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface BillsGetResponse {
  bills: Bill[];
  pagination: PaginationType | null;
}

export interface BillResponse {
  bill: Bill;
}

export interface CreateBillRequest {
  billType: number;
  billState: number;
  customerId: number;
  salesOrderId?: number;
  purchaseOrderId?: number;
  stamp?: string;
  number: string;
  date: string;
  dueDate?: string;
  paymentTerms?: string;
  total: number;
  taxTotal: number;
  isCredit: boolean;
}

export interface UpdateBillRequest {
  billType: number;
  billState: number;
  customerId: number;
  salesOrderId?: number;
  purchaseOrderId?: number;
  stamp?: string;
  number: string;
  date: string;
  dueDate?: string;
  paymentTerms?: string;
  total: number;
  taxTotal: number;
  isCredit: boolean;
}

export interface BillsParams {
  page?: number;
  pageSize?: number;
}

export const billsApi = {
  getAll: (params?: BillsParams) =>
    apiClient
      .get<BillsGetResponse>("/api/bills", { params })
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient.get<BillResponse>("/api/bills/" + id).then((r) => r.data),
  create: (body: CreateBillRequest) =>
    apiClient.post<BillResponse>("/api/bills", body).then((r) => r.data),
  edit: (id: number, body: UpdateBillRequest) =>
    apiClient.put<BillResponse>("/api/bills/" + id, body).then((r) => r.data),
};
