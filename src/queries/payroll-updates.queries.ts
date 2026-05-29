import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import { payrollUpdatesApi, type CreatePayrollUpdateRequestDto } from "@/api/payroll-updates.api";

export const payrollUpdateKeys = {
  all: ["payroll-updates"] as const,
};

export const useGetPayrollUpdates = (params?: { page?: number; pageSize?: number; search?: string }) => {
  return useQuery({
    queryKey: [...payrollUpdateKeys.all, params?.page, params?.pageSize, params?.search],
    queryFn: () => payrollUpdatesApi.getPayrollUpdates(params),
    retry: RETRIES,
  });
};

export const useCreatePayrollUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePayrollUpdateRequestDto) => payrollUpdatesApi.createPayrollUpdate(body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Novedad creada con éxito" });
      queryClient.invalidateQueries({ queryKey: payrollUpdateKeys.all });
    },
  });
};