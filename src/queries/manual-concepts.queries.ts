import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import manualConceptsApi from "@/api/manual-concepts.api";
import type { CreateManualConceptRequestDto } from "@/api/manual-concepts.api";
import { toaster } from "@/components/ui/toaster";

export const useGetPendingManualConcepts = () => {
  return useQuery({
    queryKey: ["manualConcepts", "pending"],
    queryFn: () => manualConceptsApi.getPendingManualConcepts().then((r) => r.data),
  });
};

export const useCreateManualConcept = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateManualConceptRequestDto) => manualConceptsApi.createManualConcept(body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manualConcepts", "pending"] });
      toaster.create({ title: "Novedad registrada", type: "success" });
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = anyErr?.response?.data?.message || anyErr?.message || "No se pudo registrar la novedad";
      toaster.create({ title: "Error al registrar novedad", description: message, type: "error" });
    },
  });
};
