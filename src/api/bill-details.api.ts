import type { BillDetail } from "@/types/bill-detail";
import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface BillDetailsGetResponse {
  billDetails: BillDetail[];
  pagination: PaginationType | null;
}

export interface BillDetailResponse {
  billDetail: BillDetail;
}

export interface CreateBillDetailRequest {
  billId: number;
  productId: number;
  quantity: number;
  price: number;
  taxRate: number;
}

export interface UpdateBillDetailRequest {
  billId: number;
  productId: number;
  quantity: number;
  price: number;
  taxRate: number;
}

export const billDetailsApi = {
  getByBillId: (
    billId: number,
    params?: { page?: number; pageSize?: number },
  ) =>
    apiClient
      .get<BillDetailsGetResponse>("/api/bill-details/by-bill/" + billId, {
        params,
      })
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient
      .get<BillDetailResponse>("/api/bill-details/" + id)
      .then((r) => r.data),
  create: (body: CreateBillDetailRequest) =>
    apiClient
      .post<BillDetailResponse>("/api/bill-details", body)
      .then((r) => r.data),
  edit: (id: number, body: UpdateBillDetailRequest) =>
    apiClient
      .put<BillDetailResponse>("/api/bill-details/" + id, body)
      .then((r) => r.data),
};
