import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface PurchaseRequestCreateRequest {
  observation: string;
  details: PurchaseRequestCreateDetails[];
  supplierIds?: number[];
}

export interface PurchaseRequestCreateDetails {
  productId: number;
  quantityRequested: number;
}

export interface PurchaseRequestWrapper {
  purchaseRequest: PurchaseRequest;
}

export interface PurchaseRequest {
  id: number;
  userId: number;
  userName: string;
  date: Date;
  purchaseRequestState: number;
  observation: string;
  details: PurchaseRequestDetails[];
}

export interface PurchaseRequestDetails {
  id: number;
  productId: number;
  productName: string;
  price?: number;
  taxRate?: number;
  quantityRequested: number;
}

//GETS
export interface PurchaseRequestGetResponse {
  purchaseRequests: PurchaseRequest[];
  pagination: PaginationType;
}

export interface EligibleSupplier {
  supplierId: number;
  businessName: string;
  fantasyName: string;
  productIds: number[];
  categoryNames: string[];
}

interface EligibleSuppliersResponse {
  eligibleSuppliers: EligibleSupplier[];
}

export const purchaseRequestStateMap: Record<number, string> = {
  0: "Pendiente",
  1: "Aprobado",
  2: "Rechazado",
  3: "Completado",
};

export const purchaseRequestApi = {
  get: (params: PaginationParams) =>
    apiClient
      .get<PurchaseRequestGetResponse>(`/api/purchase-requests`, { params })
      .then((r) => r.data),
  getAll: () =>
    apiClient
      .get<{
        purchaseRequests: PurchaseRequest[];
      }>(`/api/purchase-requests/all`)
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient
      .get<PurchaseRequestWrapper>(`/api/purchase-requests/${id}`)
      .then((r) => r.data.purchaseRequest),
  create: (data: PurchaseRequestCreateRequest) =>
    apiClient
      .post<PurchaseRequest>("/api/purchase-requests", data)
      .then((r) => r.data),
  getEligibleSuppliers: (productIds: number[]) => {
    const params = new URLSearchParams();
    productIds.forEach((id) => params.append("productIds", String(id)));
    return apiClient
      .get<EligibleSuppliersResponse>(`/api/suppliers/eligible?${params.toString()}`)
      .then((r) => r.data.eligibleSuppliers);
  },
};
