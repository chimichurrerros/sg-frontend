import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface PurchaseOrderDetail {
    id: number;
    productId: number;
    productName: string;
    quantityOrdered: number;
    quantityReceived: number;
    price: number;
    taxRate: number;
    supplierId: number;
    supplierName: string;
}

export interface PurchaseOrder {
    id: number;
    purchaseRequestId: number;
    supplierId: number;
    supplierName: string;
    supplierQuoteId: number;
    number: string;
    date: string;
    total: number;
    state: number;
    details: PurchaseOrderDetail[];
}

export interface PurchaseOrdersGetResponse {
    purchaseOrders: PurchaseOrder[];
    pagination: PaginationType;
}

export const purchaseOrdersApi = {
    get: (params: { page: number; pageSize: number }) =>
        apiClient.get<PurchaseOrdersGetResponse>("/api/purchaseorders", { params }).then((r) => r.data),
};
