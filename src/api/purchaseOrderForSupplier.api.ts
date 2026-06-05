import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface PurchaseOrderForSupplierSupplier {
  id: number;
  ruc: string;
  phone: string;
  address: string;
  email: string;
  isActive: boolean;
  businessName: string;
  fantasyName: string;
}

export interface PurchaseOrderForSupplierDetail {
  id: number;
  productId: number;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  price: number;
  taxRate: number;
  supplierQuoteDetailId: number;
}

export interface PurchaseOrderForSupplier {
  id: number;
  purchaseOrderId: number;
  supplierId: number;
  supplier: PurchaseOrderForSupplierSupplier;
  supplierName: string;
  supplierQuoteId: number;
  number: string;
  date: string;
  total: number;
  state: number;
  details: PurchaseOrderForSupplierDetail[];
}

export interface PurchaseOrdersForSupplierGetResponse {
  purchaseOrdersForSupplier: PurchaseOrderForSupplier[];
  pagination: PaginationType | null;
}

export interface PurchaseOrderForSupplierFilterParams {
  page?: number;
  pageSize?: number;
  supplierId?: number;
  state?: number;
}

export const purchaseOrderForSupplierStateMap: Record<number, string> = {
  1: "Pendiente",
  2: "Confirmado",
  3: "Parcialmente Recibido",
  4: "Recibido",
  5: "Cancelado",
};

export const purchaseOrderForSupplierApi = {
  getAll: (params: PurchaseOrderForSupplierFilterParams) => {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined) queryParams.Page = params.page;
    if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
    if (params.supplierId !== undefined) queryParams.SupplierId = params.supplierId;
    if (params.state !== undefined) queryParams.State = params.state;
    return apiClient
      .get<PurchaseOrdersForSupplierGetResponse>(`/api/purchaseorders-for-supplier`, { params: queryParams })
      .then((r) => r.data);
  },
  getAllWithoutPagination: () =>
    apiClient
      .get<PurchaseOrdersForSupplierGetResponse>("/api/purchaseorders-for-supplier/all")
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient
      .get<{ purchaseOrderForSupplier: PurchaseOrderForSupplier }>(`/api/purchaseorders-for-supplier/${id}`)
      .then((r) => r.data.purchaseOrderForSupplier),
  updateState: (id: number, state: number) =>
    apiClient
      .put<{ purchaseOrderForSupplier: PurchaseOrderForSupplier }>(`/api/purchaseorders-for-supplier/${id}/state`, { state })
      .then((r) => r.data.purchaseOrderForSupplier),
};
