import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/api/suppliers.api";
import type {
  CreateSupplierRequestDTO,
  EditSupplierRequestDTO,
} from "@/api/suppliers.api";

export const suppliersKeys = {
  suppliers: ["suppliers"] as const,
  supplier: (id: number | string) => ["supplier", id] as const,
};

export const useAllSuppliers = () => {
  return useQuery({
    queryKey: suppliersKeys.suppliers,
    queryFn: suppliersApi.getAllSuppliers,
  });
};

export const useGetSupplier = (id?: number) => {
  return useQuery({
    queryKey: id ? suppliersKeys.supplier(id) : ["supplier", "none"] as const,
    queryFn: () => suppliersApi.getSupplier(id ?? 0),
    enabled: Boolean(id),
  });
};

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: (data: CreateSupplierRequestDTO) =>
      suppliersApi.createSupplier(data),
  });
};

export const useEditSupplier = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: EditSupplierRequestDTO;
    }) => suppliersApi.editSupplier(id, data),
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppliersKeys.suppliers });
    },
  });
};
