import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import manualConceptsApi from "@/api/manual-concepts.api";
import type { ManualConceptIncidentCreateDto, ManualConceptIncidentResponseDto } from "@/api/manual-concepts.api";
import { toaster } from "@/components/ui/toaster";

const manualConceptKeys = {
  pending: ["manualConcepts", "pending"] as const,
};

export const useGetPendingManualConcepts = () => {
  return useQuery({
    queryKey: manualConceptKeys.pending,
    queryFn: () => manualConceptsApi.getPendingManualConcepts().then((r) => r.data),
  });
};

export const useCreateManualConcept = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ManualConceptIncidentCreateDto) => manualConceptsApi.createManualConcept(body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: manualConceptKeys.pending });
      toaster.create({ title: "Novedad registrada", type: "success" });
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = anyErr?.response?.data?.message || anyErr?.message || "No se pudo registrar la novedad";
      toaster.create({ title: "Error al registrar novedad", description: message, type: "error" });
    },
  });
};

export const useUpdateManualConcept = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ManualConceptIncidentCreateDto }) =>
      manualConceptsApi.updateManualConcept(id, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: manualConceptKeys.pending });
      toaster.create({ title: "Novedad actualizada", type: "success" });
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = anyErr?.response?.data?.message || anyErr?.message || "No se pudo actualizar la novedad";
      toaster.create({ title: "Error al actualizar novedad", description: message, type: "error" });
    },
  });
};

export const useDeleteManualConcept = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => manualConceptsApi.deleteManualConcept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: manualConceptKeys.pending });
      toaster.create({ title: "Novedad eliminada", type: "success" });
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = anyErr?.response?.data?.message || anyErr?.message || "No se pudo eliminar la novedad";
      toaster.create({ title: "Error al eliminar novedad", description: message, type: "error" });
    },
  });
};
