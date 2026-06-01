import { useQuery } from "@tanstack/react-query";
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
