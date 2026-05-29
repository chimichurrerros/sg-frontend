import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import {
  payrollProcessesApi,
  type PayrollProcessCalculationSummaryDto,
  type PayrollProcessManualDetailResponseDto,
  type PayrollProcessResponseDto,
  type UpsertPayrollProcessManualDetailRequestDto,
} from "@/api/payroll-processes.api";

export const payrollProcessKeys = {
  all: ["payroll-processes"] as const,
  detail: (id: number) => ["payroll-processes", id] as const,
  manualDetails: (id: number) => ["payroll-processes", id, "manual-details"] as const,
};

export const useGetPayrollProcess = (processId?: number) => {
  return useQuery<PayrollProcessResponseDto>({
    queryKey: processId ? payrollProcessKeys.detail(processId) : ["payroll-processes", "none"] as const,
    queryFn: () => payrollProcessesApi.getPayrollProcess(processId ?? 0),
    enabled: Boolean(processId),
    retry: RETRIES,
  });
};

export const useGetPayrollProcessManualDetails = (processId?: number) => {
  return useQuery<PayrollProcessManualDetailResponseDto[]>({
    queryKey: processId ? payrollProcessKeys.manualDetails(processId) : ["payroll-processes", "manual-details", "none"] as const,
    queryFn: () => payrollProcessesApi.getManualDetails(processId ?? 0),
    enabled: Boolean(processId),
    retry: RETRIES,
  });
};

export const useUpsertPayrollProcessManualDetail = (processId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpsertPayrollProcessManualDetailRequestDto) =>
      payrollProcessesApi.upsertManualDetail(processId ?? 0, body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Detalle manual guardado con éxito", type: "success" });
      if (processId) {
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.manualDetails(processId) });
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.detail(processId) });
      }
    },
  });
};

export const useDeletePayrollProcessManualDetail = (processId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => payrollProcessesApi.deleteManualDetail(id),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Detalle manual eliminado con éxito", type: "success" });
      if (processId) {
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.manualDetails(processId) });
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.detail(processId) });
      }
    },
  });
};

export const useCalculatePayrollProcess = (processId?: number) => {
  const queryClient = useQueryClient();

  return useMutation<PayrollProcessCalculationSummaryDto>({
    mutationFn: () => payrollProcessesApi.calculateProcess(processId ?? 0),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Cálculo de nómina ejecutado con éxito", type: "success" });
      if (processId) {
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.detail(processId) });
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.manualDetails(processId) });
      }
    },
  });
};