import { apiClient } from "./client";
import type { Bill } from "./sales.api";

export interface PurchaseReceiptDetailRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface CreatePurchaseReceiptRequest {
    purchaseOrderId: number;
    billNumber: string;
    stamp: string;
    date: string;
    supplierId: number;
    branchId: number;
    observation: string;
    details: PurchaseReceiptDetailRequest[];
}

export interface PurchaseReceiptResponse {
    bill: Bill;
}

export const purchaseReceiptsApi = {
    create: (body: CreatePurchaseReceiptRequest) =>
        apiClient.post<PurchaseReceiptResponse>("/api/purchase-receipts", body).then((r) => r.data),
};
