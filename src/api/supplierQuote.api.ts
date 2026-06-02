import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface SupplierQuoteProduct {
    id:                number;
    productId:         number;
    productName:       string;
    quantityAvailable: number;
    price:             number;
}

export interface SupplierQuote {
    id:                     number;
    supplierId:             number;
    supplierName:           string;
    purchaseRequestId:      number;
    requestForQuotationId?: number;
    date:                   Date;
    total:                  number;
    state:                  number;
    associatedPurchaseOrderId?: number;
    details:                SupplierQuoteProduct[];
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
    taxRate?:          number;
}
export interface SupplierQuoteCreateRequest {
    supplierId:            number;
    purchaseRequestId:     number;
    requestForQuotationId: number;
    details:               CreateSupplierQuoteProduct[];
}
// Post response = supplierquote

export interface SupplierQuoteFilterParams {
  page?: number;
  pageSize?: number;
  supplierId?: number;
  purchaseRequestId?: number;
  requestForQuotationId?: number;
  state?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface EditSupplierQuoteRequest {
    supplierId?:            number;
    purchaseRequestId?:     number;
    requestForQuotationId?: number;
    details?:               CreateSupplierQuoteProduct[];
    state?: number;
}

export interface SupplierQuoteWrapper { 
    supplierQuote: SupplierQuote;
}

export const supplierQuoteApi = {
    get: (params: SupplierQuoteFilterParams) => {
      const queryParams: Record<string, string | number> = {};
      if (params.page !== undefined) queryParams.Page = params.page;
      if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
      if (params.supplierId !== undefined) queryParams.SupplierId = params.supplierId;
      if (params.purchaseRequestId !== undefined) queryParams.PurchaseRequestId = params.purchaseRequestId;
      if (params.requestForQuotationId !== undefined) queryParams.RequestForQuotationId = params.requestForQuotationId;
      if (params.state !== undefined) queryParams.State = params.state;
      if (params.date !== undefined) queryParams.Date = params.date;
      if (params.startDate !== undefined) queryParams.StartDate = params.startDate;
      if (params.endDate !== undefined) queryParams.EndDate = params.endDate;
      if (params.minTotal !== undefined) queryParams.MinTotal = params.minTotal;
      if (params.maxTotal !== undefined) queryParams.MaxTotal = params.maxTotal;
      return apiClient.get<SupplierQuoteGetResponse>(`/api/supplierquotes`, { params: queryParams }).then((r) => r.data);
    },
    getAll: () => apiClient.get<{supplierQuotes: SupplierQuote[]}>(`/api/supplierquotes/all`).then((r) => r.data),
    getById: (id: number) => apiClient.get<SupplierQuoteWrapper>(`/api/supplierquotes/${id}`).then((r) => r.data.supplierQuote),
    create: (data: SupplierQuoteCreateRequest) => apiClient.post<SupplierQuoteWrapper>("/api/supplierquotes", data).then((r) => r.data.supplierQuote),
    edit: (id: number, data: EditSupplierQuoteRequest) => apiClient.put<SupplierQuoteWrapper>(`/api/supplierquotes/${id}`, data).then((r) => r.data.supplierQuote),
}