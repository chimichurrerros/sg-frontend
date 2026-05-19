import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface SupplierQuoteProduct {
    id:                number;
    productId:         number;
    productName:       string;
    quantityAvailable: number;
    price:             number;
    taxRate:           number;
    total?:             number;
}

export interface SupplierQuote {
    id:                number;
    supplierId:        number;
    supplierName:      string;
    purchaseRequestId: number;
    date:              Date;
    total:             number;
    supplierQuoteState:           number;
    details:           SupplierQuoteProduct[];
}
//GET 
export interface SupplierQuoteGetResponse {
    supplierQuotes: SupplierQuote[];
    pagination: PaginationType;
}
//POST 
export interface CreateSupplierQuoteProduct {
    productId:         number;
    quantityAvailable: number;
    price:             number;
    taxRate:           number;
}
export interface SupplierQuoteCreateRequest {
    supplierId:        number;
    purchaseRequestId: number;
    details:           CreateSupplierQuoteProduct[];
}
// Post response = supplierquote

export interface EditSupplierQuoteRequest {
    supplierId:        number;
    purchaseRequestId: number;
    details:           CreateSupplierQuoteProduct[];
}

export const supplierQuoteApi = {
    get: (params: PaginationParams) => apiClient.get<SupplierQuoteGetResponse>(`/api/supplierquotes`,{ params }).then((r) => r.data),
    getAll: () => apiClient.get<{supplierQuotes: SupplierQuote[]}>(`/api/supplierquotes/all`).then((r) => r.data),
    getById: (id: number) => apiClient.get<SupplierQuote>(`/api/supplierquotes/${id}`).then((r) => r.data),
    create: (data: SupplierQuoteCreateRequest) => apiClient.post<SupplierQuote>("/api/supplierquotes", data).then((r) => r.data),
    edit: (id: number, data: EditSupplierQuoteRequest) => apiClient.put<SupplierQuote>(`/api/supplierquotes/${id}`, data).then((r) => r.data),
}