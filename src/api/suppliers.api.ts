import type { Supplier, SupplierRequestDTO } from "@/types/suppliers";
import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface ListSuppliersWrapperDTO {
    suppliers: Supplier[];
    pagination: PaginationType | null;
}

export interface SupplierResponseDTO {
    supplier: Supplier;
}

export interface CreateSupplierRequestDTO {
    ruc: string;
    businessName: string;
    fantasyName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    isActive?: boolean;
    productCategoryIds?: number[];
}

export interface EditSupplierRequestDTO {
    ruc?: string;
    businessName?: string;
    fantasyName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    isActive?: boolean;
    productCategoryIds?: number[];
}

export const suppliersApi = {
    getAllSuppliers: () =>
        apiClient
            .get<ListSuppliersWrapperDTO>("/api/suppliers")
            .then((r) => r.data),
    getSupplier: (id: number) =>
        apiClient
            .get<SupplierResponseDTO>(`/api/suppliers/${id}`)
            .then((r) => r.data),
    createSupplier: (body: CreateSupplierRequestDTO) =>
        apiClient
            .post<SupplierResponseDTO>("/api/suppliers", body)
            .then((r) => r.data),
    editSupplier: (id: number, body: EditSupplierRequestDTO) =>
        apiClient
            .put<SupplierResponseDTO>(`/api/suppliers/${id}`, body)
            .then((r) => r.data),
    deleteSupplier: (id: number) =>
        apiClient.delete(`/api/suppliers/${id}`).then((r) => r.data),
};