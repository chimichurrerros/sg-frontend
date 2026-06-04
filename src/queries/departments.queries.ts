import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import { departmentsApi } from "@/api/departments.api";
import type {
  DepartmentRequestDto,
  ListDepartmentsWrapperDto,
  OrganizationQueryDto,
} from "@/types/organization";

export const departmentKeys = {
  all: ["departments"] as const,
};

export const useGetDepartments = (params?: OrganizationQueryDto) => {
  return useQuery<ListDepartmentsWrapperDto>({
    queryKey: [
      ...departmentKeys.all,
      params?.page,
      params?.pageSize,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => departmentsApi.getDepartments(params),
    retry: RETRIES,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DepartmentRequestDto) => departmentsApi.createDepartment(body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Área creada con éxito" });
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DepartmentRequestDto }) =>
      departmentsApi.updateDepartment(id, body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Área actualizada con éxito" });
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.deleteDepartment(id),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Área eliminada con éxito" });
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
};
