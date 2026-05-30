import {
  catalogApi,
  type ProductBrandRequestDTO,
  type ProductCategoryRequestDTO,
  type ProductRequestDTO,
} from "@/api/catalog.api";
import { servicesApi, type ServiceRequestDto } from "@/api/service.api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const catalogKeys = {
  products: ["products"] as const,
  product: (id: number) => ["product", id] as const,
  services: ["services"] as const,
  service: (id: number) => ["service", id] as const,
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

export const useGetProduct = (id?: number) => {
  return useQuery({
    queryKey: id ? catalogKeys.product(id) : ["product", "none"] as const,
    queryFn: () => catalogApi.getProduct(id!),
    enabled: Boolean(id),
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

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequestDTO }) =>
      catalogApi.updateProduct(id, data),
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteProduct(id),
  });
};

/* ===== Services ===== */
export const useAllServices = () => {
  return useQuery({
    queryKey: catalogKeys.services,
    queryFn: servicesApi.getAll,
  });
};

export const useGetService = (id?: number) => {
  return useQuery({
    queryKey: id ? catalogKeys.service(id) : ["service", "none"] as const,
    queryFn: () => servicesApi.getById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateService = () => {
  return useMutation({
    mutationFn: (data: ServiceRequestDto) => servicesApi.create(data),
  });
};

export const useUpdateService = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceRequestDto }) =>
      servicesApi.update(id, data),
  });
};

export const useDeleteService = () => {
  return useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
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

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductCategoryRequestDTO }) =>
      catalogApi.updateCategory(id, data),
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

export const useUpdateBrand = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductBrandRequestDTO }) =>
      catalogApi.updateBrand(id, data),
  });
};

export const useDeleteBrand = () => {
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteBrand(id),
  });
};
