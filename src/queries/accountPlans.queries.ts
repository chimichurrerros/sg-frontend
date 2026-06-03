import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountPlansApi, type CreateAccountPlanData, type UpdateAccountPlanData } from "@/api/accountPlans.api";

export const accountPlansKeys = {
  all: ["accountPlans"] as const,
  list: (page: number, pageSize: number) => ["accountPlans", "list", page, pageSize] as const,
  detail: (id: number) => ["accountPlans", "detail", id] as const,
};

const RETRIES = 2;

export const useAllAccountPlans = () => {
  return useQuery({
    queryKey: accountPlansKeys.all,
    queryFn: accountPlansApi.getAll,
    retry: RETRIES,
  });
};

export const useAccountPlansList = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: accountPlansKeys.list(page, pageSize),
    queryFn: () => accountPlansApi.getList(page, pageSize),
    retry: RETRIES,
  });
};

export const useAccountPlanDetail = (id: number) => {
  return useQuery({
    queryKey: accountPlansKeys.detail(id),
    queryFn: () => accountPlansApi.getById(id),
    retry: RETRIES,
    enabled: !!id,
  });
};

export const useCreateAccountPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountPlanData) => accountPlansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountPlansKeys.all });
    },
  });
};

export const useUpdateAccountPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountPlanData }) =>
      accountPlansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountPlansKeys.all });
      queryClient.invalidateQueries({ queryKey: accountPlansKeys.detail(variables.id) });
    },
  });
};

export const useDeleteAccountPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountPlansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountPlansKeys.all });
    },
  });
};
