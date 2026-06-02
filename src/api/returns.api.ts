import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface SaleReturnRequest {
    billId:  number;
    date:    string;
    total:   number;
    reason:  string;
    details: Partial<SaleReturnRequestDetail>[];
}

export interface SaleReturnRequestDetail {
    productId: number;
    quantity:  number;
    price:     number;
}

export interface SaleReturn {
    id:               number;
    creditNoteId:     number;
    billId:           number;
    salesOrderId:     number;
    salesOrderNumber: string;
    branchId:         number;
    branchName:       string;
    customerId:       number;
    customerName:     string;
    customerRuc:      string;
    date:             string;
    total:            number;
    reason:           string;
    details:          SaleReturnDetail[];
}

export interface SaleReturnDetail {
    id:          number;
    productId:   number;
    productName: string;
    quantity:    number;
    price:       number;
    maxQuantity?:number; //Auxiliar field used for return quantity control
}

export interface SaleReturnParams extends PaginationParams {
    salesOrderNumber?: string;
    customerName?: string;
    customerRuc?: string;
    branchId?: number;
    date?: string;
    minDate?: string;
    maxDate?: string;
}


export const salesReturnApi = {
    create: (data: SaleReturnRequest) => apiClient.post<{salesReturn: SaleReturn}>("/api/sales-returns", data).then(res => res.data.salesReturn),
    get: (params: SaleReturnParams) => apiClient.get<{salesReturns: SaleReturn[],pagination:PaginationType}>("/api/sales-returns", { params }).then(res => res.data),
    getById: (id: number) => apiClient.get<{salesReturn: SaleReturn}>(`/api/sales-returns/${id}`).then(res => res.data.salesReturn),
    getAll: () => apiClient.get<{salesReturns: SaleReturn[]}>("/api/sales-returns/all").then(res => res.data.salesReturns),
}