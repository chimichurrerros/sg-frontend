import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface ProductResponseDto {
    id: number;
    productCategoryId: number;
    productCategoryName: string;
    productBrandId: number;
    productBrandName: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    minimumStock: number;
}

export interface ProductsGetResponse {
    products: ProductResponseDto[];
    pagination: PaginationType | null;
}

export const productsApi = {
    getAll: () => apiClient.get<ProductsGetResponse>("/api/products/all").then((r) => r.data),
};
