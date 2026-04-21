import { catalogApi } from "@/api/catalog.api";
import { useQuery } from "@tanstack/react-query";

export const catalogKeys = {
  categories: ["categories"] as const,
  brands: ["brands"] as const,
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: catalogApi.getAllCategories,
  });
};

export const useAllBrands = () => {
  return useQuery({
    queryKey: catalogKeys.brands,
    queryFn: catalogApi.getAllBrands,
  });
};