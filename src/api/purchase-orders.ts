import { apiClient } from "./client";
import type { PaginationType } from "@/types/types";

export interface PurchaseOrderDetailDTO {
    id: number;
    productId: number;
    productName: string;
    quantityOrdered: number;
    quantityReceived: number;
    price: number;
    taxRate: number;
    supplierQuoteDetailId: number;
    supplierQuoteId: number;
    supplierId: number;
    supplierName: string;
}

export interface PurchaseOrderForSupplierSupplierDTO {
    id: number;
    ruc: string;
    phone: string | null;
    address: string | null;
    email: string | null;
    isActive: boolean;
    businessName: string;
    fantasyName: string | null;
}

export interface PurchaseOrderForSupplierDetailDTO {
    id: number;
    productId: number;
    productName: string;
    quantityOrdered: number;
    quantityReceived: number;
    price: number;
    taxRate: number;
    supplierQuoteDetailId: number;
}

export interface PurchaseOrderForSupplierItemDTO {
    id: number;
    purchaseOrderId: number;
    supplierId: number;
    supplier: PurchaseOrderForSupplierSupplierDTO;
    supplierName: string;
    supplierQuoteId: number;
    number: string;
    date: string;
    total: number;
    state: number;
    details: PurchaseOrderForSupplierDetailDTO[];
}

export interface PurchaseOrderDTO {
    id: number;
    purchaseRequestId: number;
    supplierId: number;
    supplierName: string;
    supplierQuoteId: number;
    number: string;
    date: string;
    total: number;
    state: number;
    details: PurchaseOrderDetailDTO[];
    purchaseOrdersForSupplier?: PurchaseOrderForSupplierItemDTO[];
}

export interface ListPurchaseOrdersWrapperDTO {
    purchaseOrders: PurchaseOrderDTO[];
    pagination: PaginationType | null;
}

export interface PurchaseOrderResponseDTO {
    purchaseOrder: PurchaseOrderDTO;
}

export interface CreatePurchaseOrderDetailDTO {
    productId: number;
    quantityOrdered: number;
    supplierQuoteDetailId: number;
}

export interface CreatePurchaseOrderDTO {
    purchaseRequestId: number;
    supplierId: number;
    details: CreatePurchaseOrderDetailDTO[];
}

export interface PurchaseOrderFilterParams {
  page?: number;
  pageSize?: number;
  purchaseRequestId?: number;
  state?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface EditPurchaseOrderDTO {
    purchaseRequestId?: number;
    supplierId?: number;
    details?: CreatePurchaseOrderDetailDTO[];
}

export const purchaseOrdersApi = {
    getAll: () =>
        apiClient
            .get<ListPurchaseOrdersWrapperDTO>("/api/purchaseorders/all")
            .then((r) => r.data),
    get: (params: PurchaseOrderFilterParams) => {
      const queryParams: Record<string, string | number> = {};
      if (params.page !== undefined) queryParams.Page = params.page;
      if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
      if (params.purchaseRequestId !== undefined) queryParams.PurchaseRequestId = params.purchaseRequestId;
      if (params.state !== undefined) queryParams.State = params.state;
      if (params.date !== undefined) queryParams.Date = params.date;
      if (params.startDate !== undefined) queryParams.StartDate = params.startDate;
      if (params.endDate !== undefined) queryParams.EndDate = params.endDate;
      if (params.minTotal !== undefined) queryParams.MinTotal = params.minTotal;
      if (params.maxTotal !== undefined) queryParams.MaxTotal = params.maxTotal;
      return apiClient
        .get<ListPurchaseOrdersWrapperDTO>("/api/purchaseorders", { params: queryParams })
        .then((r) => r.data);
    },
    getById: (id: number) =>
        apiClient
            .get<PurchaseOrderResponseDTO>(`/api/purchaseorders/${id}`)
            .then((r) => r.data),
    create: (body: CreatePurchaseOrderDTO) =>
        apiClient
            .post<PurchaseOrderResponseDTO>("/api/purchaseorders", body)
            .then((r) => r.data),
    edit: (id: number, body: EditPurchaseOrderDTO) =>
        apiClient
            .put<PurchaseOrderResponseDTO>(`/api/purchaseorders/${id}`, body)
            .then((r) => r.data),
    getDraft: (purchaseRequestId: number) =>
        apiClient
            .get<PurchaseOrderResponseDTO>(`/api/purchaseorders/draft/${purchaseRequestId}`)
            .then((r) => r.data),
};