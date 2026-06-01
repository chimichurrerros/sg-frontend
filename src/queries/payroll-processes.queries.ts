import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import {
  payrollProcessesApi,
  type PayrollProcessCalculationResponseDto,
  type PayrollManualDetailResponseDto,
  type PayrollProcessResponseDto,
  type PayrollProcessCreateDto,
  type PayrollProcessUpdateDto,
  type PayrollManualInputDto,
  type UpdatePayrollProcessStatusRequestDto,
} from "@/api/payroll-processes.api";

export const payrollProcessKeys = {
  all: ["payroll-processes"] as const,
  detail: (id: number) => ["payroll-processes", id] as const,
  manualDetails: (id: number) => ["payroll-processes", id, "manual-details"] as const,
};

export const useGetPayrollProcesses = () => {
  return useQuery<PayrollProcessResponseDto[]>({
    queryKey: payrollProcessKeys.all,
    queryFn: () => payrollProcessesApi.getPayrollProcesses(),
    retry: RETRIES,
  });
};

export const useCreatePayrollProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PayrollProcessCreateDto) => payrollProcessesApi.createPayrollProcess(body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Planilla creada con éxito", type: "success" });
      queryClient.invalidateQueries({ queryKey: payrollProcessKeys.all });
    },
  });
};

export const useUpdatePayrollProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PayrollProcessUpdateDto }) =>
      payrollProcessesApi.updatePayrollProcess(id, body),
    retry: RETRIES,
    onSuccess: (_, variables) => {
      toaster.create({ title: "Planilla actualizada con éxito", type: "success" });
      queryClient.invalidateQueries({ queryKey: payrollProcessKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollProcessKeys.detail(variables.id) });
    },
  });
};

export const useDeletePayrollProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => payrollProcessesApi.deletePayrollProcess(id),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Planilla eliminada con éxito", type: "success" });
      queryClient.invalidateQueries({ queryKey: payrollProcessKeys.all });
    },
  });
};

export const useGetPayrollProcess = (processId?: number) => {
  return useQuery<PayrollProcessResponseDto>({
    queryKey: processId ? payrollProcessKeys.detail(processId) : ["payroll-processes", "none"] as const,
    queryFn: () => payrollProcessesApi.getPayrollProcess(processId ?? 0),
    enabled: Boolean(processId),
    retry: RETRIES,
  });
};

export const useUpdatePayrollProcessStatus = (processId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePayrollProcessStatusRequestDto) =>
      payrollProcessesApi.updatePayrollProcessStatus(processId ?? 0, body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Estado de planilla actualizado", type: "success" });
      if (processId) {
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.detail(processId) });
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.manualDetails(processId) });
      }
    },
  });
};

export const useGetPayrollProcessManualDetails = (processId?: number) => {
  return useQuery<PayrollManualDetailResponseDto[]>({
    queryKey: processId ? payrollProcessKeys.manualDetails(processId) : ["payroll-processes", "manual-details", "none"] as const,
    queryFn: () => payrollProcessesApi.getManualDetails(processId ?? 0),
    enabled: Boolean(processId),
    retry: RETRIES,
  });
};

export const useUpsertPayrollProcessManualDetail = (processId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PayrollManualInputDto) =>
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

  return useMutation<PayrollProcessCalculationResponseDto>({
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

export const useCloseAndPayPayrollProcess = (processId?: number) => {
  const queryClient = useQueryClient();

  return useMutation<any>({
    mutationFn: () => payrollProcessesApi.closeAndPayProcess(processId ?? 0),
    retry: RETRIES,
    onSuccess: (data) => {
      toaster.create({
        title: "Planilla cerrada y pagada",
        description: data?.statusMessage ?? "Asiento contable generado en el libro diario.",
        type: "success",
      });
      if (processId) {
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.all });
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.detail(processId) });
        queryClient.invalidateQueries({ queryKey: payrollProcessKeys.manualDetails(processId) });
      }
    },
  });
};