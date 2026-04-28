import type { StockItem } from "@/types/inventory";
import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface StockGetResponse {
    items: StockItem[];
    pagination: PaginationType | null;
}

export interface EditStockItemRequest {
    productId?: number;
    productName?: string;
    branchId?: number;
    branchName?: string;
    quantity?: number;
}

export interface StockItemResponse {
    item: StockItem
}

export interface CreateStockItemRequest {
    productId: number;
    productName: string;
    branchId: number;
    branchName: string;
    quantity: number;
}

export const stockApi = {
    getAll: () => apiClient.get<StockGetResponse>("/api/stock/all").then((r) => r.data),
    create: (body: CreateStockItemRequest) => apiClient.post<StockItemResponse>("/api/stock", body).then((r) => r.data),
    edit: (id: number, body: EditStockItemRequest) => apiClient.put<StockItemResponse>("/api/stock/" + id, body).then((r) => r.data),
    delete: (id: number) => apiClient.delete("/api/stock/" + id).then((r) => r.data)
}
