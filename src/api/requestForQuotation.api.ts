import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface RequestForQuotationProduct {
  productId: number;
  productName: string;
  quantityRequested: number;
  categoryId: number;
  categoryName: string;
  productCost: number;
}

export interface RequestForQuotation {
  id: number;
  purchaseRequestId: number;
  supplierId: number;
  supplierName: string;
  date: string;
  state: number;
  observation: string;
  purchaseRequestDate: string;
  purchaseRequestState: number;
  purchaseRequestObservation: string;
  products: RequestForQuotationProduct[];
}

export interface RequestForQuotationGetResponse {
  requestForQuotations: RequestForQuotation[];
  pagination: PaginationType;
}

export interface RequestForQuotationWrapper {
  requestForQuotation: RequestForQuotation;
}

export interface RequestForQuotationFilterParams {
  page?: number;
  pageSize?: number;
  supplierId?: number;
  purchaseRequestId?: number;
  state?: number;
}

export const requestForQuotationStateMap: Record<number, string> = {
  0: "Pendiente",
  1: "Aprobado",
  2: "Rechazado",
  3: "Completado",
};

export const requestForQuotationApi = {
  getAll: (params: RequestForQuotationFilterParams) => {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined) queryParams.Page = params.page;
    if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
    if (params.supplierId !== undefined) queryParams.SupplierId = params.supplierId;
    if (params.purchaseRequestId !== undefined) queryParams.PurchaseRequestId = params.purchaseRequestId;
    if (params.state !== undefined) queryParams.State = params.state;
    return apiClient
      .get<RequestForQuotationGetResponse>(`/api/request-for-quotations`, { params: queryParams })
      .then((r) => r.data);
  },
  getById: (id: number) =>
    apiClient
      .get<RequestForQuotationWrapper>(`/api/request-for-quotations/${id}`)
      .then((r) => r.data.requestForQuotation),
  getBySupplierAndPurchaseRequest: (supplierId: number, purchaseRequestId: number) => {
    const queryParams: Record<string, string | number> = {
      SupplierId: supplierId,
      PurchaseRequestId: purchaseRequestId,
    };
    return apiClient
      .get<RequestForQuotationGetResponse>(`/api/request-for-quotations`, { params: queryParams })
      .then((r) => r.data.requestForQuotations?.[0]);
  },
};
