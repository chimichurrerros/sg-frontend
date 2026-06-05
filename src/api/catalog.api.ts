import { apiClient } from "./client";

export interface ProductDTO {
  id: number;
  productCategoryId?: number | null;
  productCategoryName?: string | null;
  productBrandId?: number | null;
  productBrandName?: string | null;
  name: string | null;
  description: string | null;
  price: number;
  cost?: number | null;
  minimumStock?: number;
  stock: number;
  barcode: string;
  taxRate: number;
  quantity: number;
  total?: number;
  isDeleted?: boolean;
}

export interface ListProductsWrapperDTO {
  products: ProductDTO[];
}

export interface ProductRequestDTO {
  productCategoryId: number;
  productBrandId: number;
  name?: string | null;
  description?: string | null;
  barcode: string;
  price: number;
  cost: number;
  minimumStock: number;
}

export interface ProductCategoryDTO {
  id: number;
  name: string;
}

export interface ListProductCategoriesWrapperDTO {
  productCategories: ProductCategoryDTO[];
}

export interface ProductCategoryRequestDTO {
  name: string;
}

export interface ProductBrandDTO {
  id: number;
  name: string;
}

export interface ListProductBrandsWrapperDTO {
  productBrands: ProductBrandDTO[];
}

export interface ProductBrandRequestDTO {
  name: string;
}

export interface ProductWrapperDTO {
  product: ProductDTO;
}

export const catalogApi = {
  // Products
  getAllProducts: () =>
    apiClient
      .get<ListProductsWrapperDTO>("/api/products/all")
      .then((r) => r.data),
  getProduct: (id: number) =>
    apiClient
      .get<ProductWrapperDTO>(`/api/products/${id}`)
      .then((r) => r.data),
  createProduct: (data: ProductRequestDTO) =>
    apiClient
      .post<ProductRequestDTO>("/api/products", data)
      .then((r) => r.data),
  updateProduct: (id: number, data: ProductRequestDTO) =>
    apiClient
      .put<ProductRequestDTO>(`/api/products/${id}`, data)
      .then((r) => r.data),
  deleteProduct: (id: number) =>
    apiClient.delete(`/api/products/${id}`).then((r) => r.data),

  getProductByBranch: (id: number, excludeServices?: boolean) =>
    apiClient
      .get<{ productsStock: ProductDTO[] }>(`/api/products/by-branch/${id}`, { params: { excludeServices } })
      .then((r) => r.data),

  // Categories
  getAllCategories: () =>
    apiClient
      .get<ListProductCategoriesWrapperDTO>("/api/product-categories/all")
      .then((r) => r.data),
  createCategory: (data: ProductCategoryRequestDTO) =>
    apiClient
      .post<ProductCategoryRequestDTO>("/api/product-categories", data)
      .then((r) => r.data),
  updateCategory: (id: number, data: ProductCategoryRequestDTO) =>
    apiClient
      .put<ProductCategoryRequestDTO>(`/api/product-categories/${id}`, data)
      .then((r) => r.data),
  deleteCategory: (id: number) =>
    apiClient.delete(`/api/product-categories/${id}`).then((r) => r.data),

  // Brands
  createBrand: (data: ProductBrandRequestDTO) =>
    apiClient
      .post<ProductBrandRequestDTO>("/api/product-brands", data)
      .then((r) => r.data),
  getAllBrands: () =>
    apiClient
      .get<ListProductBrandsWrapperDTO>("/api/product-brands/all")
      .then((r) => r.data),
  updateBrand: (id: number, data: ProductBrandRequestDTO) =>
    apiClient
      .put<ProductBrandRequestDTO>(`/api/product-brands/${id}`, data)
      .then((r) => r.data),
  deleteBrand: (id: number) =>
    apiClient.delete(`/api/product-brands/${id}`).then((r) => r.data),
};
