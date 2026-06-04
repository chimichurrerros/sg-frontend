import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface PurchaseReturnDetailResponse {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    taxRate: number;
    lineTotal: number;
}

export interface PurchaseReturnResponse {
    id: number;
    purchaseOrderForSupplierId: number;
    billId: number | null;
    creditNoteId: number | null;
    branchId: number;
    branchName: string;
    reasonId: number;
    reasonName: string;
    number: string;
    date: string;
    observation: string | null;
    total: number;
    taxTotal: number;
    state: number;
    supplierName: string;
    customerName: string;
    details: PurchaseReturnDetailResponse[];
}

export interface ListPurchaseReturnsWrapper {
    purchaseReturns: PurchaseReturnResponse[];
    pagination: PaginationType | null;
}

export interface PurchaseReturnWrapper {
    purchaseReturn: PurchaseReturnResponse;
}

export interface PurchaseReturnFilterParams {
    page?: number;
    pageSize?: number;
    number?: string;
    date?: string;
    reasonId?: number;
    reasonName?: string;
    customerName?: string;
    supplierName?: string;
}

export interface PurchaseReturnDetailRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface PurchaseReturnBillRequest {
    purchaseOrderForSupplierId: number;
    number: string;
    date: string;
    total: number;
    taxTotal: number;
}

export interface CreatePurchaseReturnRequest {
    bill: PurchaseReturnBillRequest;
    return: {
        purchaseOrderForSupplierId: number;
        billId: number;
        branchId: number;
        reasonId: number;
        reasonName?: string;
        number: string;
        creditNoteNumber: string;
        date: string;
        observation?: string;
        details: PurchaseReturnDetailRequest[];
    };
}

export const purchaseReturnStateMap: Record<number, string> = {
    1: "Creado",
    2: "Emitido",
    3: "Cancelado",
};

export const purchaseReturnsApi = {
    get: (params: PurchaseReturnFilterParams) => {
        const queryParams: Record<string, string | number> = {};
        if (params.page !== undefined) queryParams.Page = params.page;
        if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
        if (params.number !== undefined) queryParams.Number = params.number;
        if (params.date !== undefined) queryParams.Date = params.date;
        if (params.reasonId !== undefined) queryParams.ReasonId = params.reasonId;
        if (params.reasonName !== undefined) queryParams.ReasonName = params.reasonName;
        if (params.customerName !== undefined) queryParams.CustomerName = params.customerName;
        if (params.supplierName !== undefined) queryParams.SupplierName = params.supplierName;
        return apiClient
            .get<ListPurchaseReturnsWrapper>("/api/purchase-returns", { params: queryParams })
            .then((r) => r.data);
    },
    getById: (id: number) =>
        apiClient.get<PurchaseReturnWrapper>(`/api/purchase-returns/${id}`).then((r) => r.data),
    create: (body: CreatePurchaseReturnRequest) =>
        apiClient.post<PurchaseReturnWrapper>("/api/purchase-returns/with-bill", body).then((r) => r.data),
};
