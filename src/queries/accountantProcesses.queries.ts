import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountantProcessesApi } from "@/api/accountantProcesses.api";

export const accountantProcessesKeys = {
  all: ["accountantProcesses"] as const,
};

const RETRIES = 2;

export const useAllAccountantProcesses = () => {
  return useQuery({
    queryKey: accountantProcessesKeys.all,
    queryFn: accountantProcessesApi.getAll,
    retry: RETRIES,
  });
};

export const useCreateAccountantProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountantProcessesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountantProcessesKeys.all });
    },
  });
};

export const useUpdateAccountantProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; isClosed: boolean } }) =>
      accountantProcessesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountantProcessesKeys.all });
    },
  });
};
