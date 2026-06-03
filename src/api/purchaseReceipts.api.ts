import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";
import type { Bill } from "./sales.api";

export interface PurchaseReceiptDetailResponse {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    taxRate: number;
    lineTotal: number;
}

export interface PurchaseReceiptResponse {
    id: number;
    purchaseOrderForSupplierId: number;
    billId: number | null;
    branchId: number;
    branchName: string;
    supplierId: number;
    supplierName: string;
    number: string;
    stamp: string | null;
    date: string;
    observation: string | null;
    total: number;
    taxTotal: number;
    details: PurchaseReceiptDetailResponse[];
}

export interface ListPurchaseReceiptsWrapper {
    purchaseReceipts: PurchaseReceiptResponse[];
    pagination: PaginationType | null;
}

export interface PurchaseReceiptWrapper {
    purchaseReceipt: PurchaseReceiptResponse;
}

export interface PurchaseReceiptFilterParams {
    page?: number;
    pageSize?: number;
    purchaseOrderForSupplierId?: number;
    branchId?: number;
    supplierId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
}

export interface PurchaseReceiptDetailRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface CreatePurchaseReceiptRequest {
    purchaseOrderForSupplierId: number;
    billNumber: string;
    stamp: string;
    date: string;
    supplierId: number;
    branchId: number;
    observation: string;
    details: PurchaseReceiptDetailRequest[];
}

export interface PurchaseReceiptBillResponse {
    bill: Bill;
}

export const purchaseReceiptsApi = {
    get: (params: PurchaseReceiptFilterParams) => {
        const queryParams: Record<string, string | number> = {};
        if (params.page !== undefined) queryParams.Page = params.page;
        if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
        if (params.purchaseOrderForSupplierId !== undefined) queryParams.PurchaseOrderForSupplierId = params.purchaseOrderForSupplierId;
        if (params.branchId !== undefined) queryParams.BranchId = params.branchId;
        if (params.supplierId !== undefined) queryParams.SupplierId = params.supplierId;
        if (params.date !== undefined) queryParams.Date = params.date;
        if (params.startDate !== undefined) queryParams.StartDate = params.startDate;
        if (params.endDate !== undefined) queryParams.EndDate = params.endDate;
        return apiClient
            .get<ListPurchaseReceiptsWrapper>("/api/purchase-receipts", { params: queryParams })
            .then((r) => r.data);
    },
    getAll: () =>
        apiClient
            .get<ListPurchaseReceiptsWrapper>("/api/purchase-receipts/all")
            .then((r) => r.data),
    getById: (id: number) =>
        apiClient
            .get<PurchaseReceiptWrapper>(`/api/purchase-receipts/${id}`)
            .then((r) => r.data),
    create: (body: CreatePurchaseReceiptRequest) =>
        apiClient.post<PurchaseReceiptBillResponse>("/api/purchase-receipts", body).then((r) => r.data),
};
