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