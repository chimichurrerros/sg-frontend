import { apiClient } from "./client";

export interface CategoryDTO {
  id: string;
  name: string;
}

export interface CategoriesWrapperDto {
  productCategories: CategoryDTO[];
}

export interface BrandDTO {
  id: string;
  name: string;
}

export interface BrandsWrapperDto {
  productBrands: BrandDTO[];
}

export const catalogApi = {
  getAllCategories: () =>
    apiClient
      .get<CategoriesWrapperDto>("/api/product-categories/all")
      .then((r) => r.data),
  getAllBrands: () =>
    apiClient
      .get<BrandsWrapperDto>("/api/product-brands/all")
      .then((r) => r.data),
};
