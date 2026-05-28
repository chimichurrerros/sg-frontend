import {
  catalogApi,
  type ProductBrandRequestDTO,
  type ProductCategoryRequestDTO,
  type ProductRequestDTO,
} from "@/api/catalog.api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const catalogKeys = {
  products: ["products"] as const,
  services: ["services"] as const,
  categories: ["categories"] as const,
  brands: ["brands"] as const,
};

/* ===== Products ===== */
export const useAllProducts = (enabled:boolean = true) => {
  return useQuery({
    queryKey: catalogKeys.products,
    queryFn: catalogApi.getAllProducts,
    enabled
  });
};

export const useProductByBranch = (id: number | null,enabled:boolean = true) => {
  return useQuery({
    queryKey: [...catalogKeys.products, "branch", id],
    queryFn: () => catalogApi.getProductByBranch(id!),
    enabled: !!id && enabled
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data: ProductRequestDTO) => catalogApi.createProduct(data),
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteProduct(id), // TODO: delete endpoint should return deleted element
  });
};

/* ===== Services ===== */
export const useAllServices = () => {
  return useQuery({
    queryKey: catalogKeys.services,
    queryFn: catalogApi.getAllProducts,
  });
};

export const useCreateService = () => {
  return useMutation({
    mutationFn: (data: ProductRequestDTO) => catalogApi.createProduct(data),
  });
};

/* ===== Product Categories ===== */
export const useAllCategories = () => {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: catalogApi.getAllCategories,
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: ProductCategoryRequestDTO) =>
      catalogApi.createCategory(data),
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteCategory(id),
  });
};

/* ===== Product Brands ===== */
export const useAllBrands = () => {
  return useQuery({
    queryKey: catalogKeys.brands,
    queryFn: catalogApi.getAllBrands,
  });
};

export const useCreateBrand = () => {
  return useMutation({
    mutationFn: (data: ProductBrandRequestDTO) => catalogApi.createBrand(data),
  });
};

export const useDeleteBrand = () => {
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteBrand(id),
  });
};
