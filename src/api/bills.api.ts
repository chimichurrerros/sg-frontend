import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";
import type { Bill } from "./sales.api";

export interface BillsGetResponse {
  bills: Bill[];
  pagination: PaginationType | null;
}

export interface BillResponse {
  bill: Bill;
}

export interface BillFilterParams {
  page?: number;
  pageSize?: number;
  customerName?: string;
  customerId?: number;
  number?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  customerRuc?: string;
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

export const billsApi = {
  getAll: (params?: BillFilterParams) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.page !== undefined) queryParams.Page = params.page;
    if (params?.pageSize !== undefined) queryParams.PageSize = params.pageSize;
    if (params?.customerName !== undefined) queryParams.CustomerName = params.customerName;
    if (params?.customerId !== undefined) queryParams.CustomerId = params.customerId;
    if (params?.number !== undefined) queryParams.Number = params.number;
    if (params?.date !== undefined) queryParams.Date = params.date;
    if (params?.startDate !== undefined) queryParams.StartDate = params.startDate;
    if (params?.endDate !== undefined) queryParams.EndDate = params.endDate;
    if (params?.customerRuc !== undefined) queryParams.CustomerRuc = params.customerRuc;
    return apiClient
      .get<BillsGetResponse>("/api/bills", { params: queryParams })
      .then((r) => r.data);
  },
  getById: (id: number) =>
    apiClient.get<BillResponse>("/api/bills/" + id).then((r) => r.data),
  create: (body: CreateBillRequest) =>
    apiClient.post<BillResponse>("/api/bills", body).then((r) => r.data),
  edit: (id: number, body: UpdateBillRequest) =>
    apiClient.put<BillResponse>("/api/bills/" + id, body).then((r) => r.data),
};
