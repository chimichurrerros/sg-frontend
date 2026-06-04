import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import { payrollUpdatesApi, type CreatePayrollUpdateRequestDto, type UpdatePayrollUpdateRequestDto } from "@/api/payroll-updates.api";

export const payrollUpdateKeys = {
  all: ["payroll-updates"] as const,
};

export const useGetPayrollUpdates = () => {
  return useQuery({
    queryKey: payrollUpdateKeys.all,
    queryFn: () => payrollUpdatesApi.getPayrollUpdates(),
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

export const useUpdatePayrollUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdatePayrollUpdateRequestDto }) =>
      payrollUpdatesApi.updatePayrollUpdate(id, body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Novedad actualizada con éxito" });
      queryClient.invalidateQueries({ queryKey: payrollUpdateKeys.all });
    },
  });
};