import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entriesApi, type CreateEntryData, type UpdateEntryData } from "@/api/entries.api";

export const entriesKeys = {
  all: ["entries"] as const,
  list: (page: number, pageSize: number) => ["entries", "list", page, pageSize] as const,
  detail: (id: number) => ["entries", "detail", id] as const,
};

const RETRIES = 2;

export const useAllEntries = () => {
  return useQuery({
    queryKey: entriesKeys.all,
    queryFn: entriesApi.getAll,
    retry: RETRIES,
  });
};

export const useEntriesList = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: entriesKeys.list(page, pageSize),
    queryFn: () => entriesApi.getList(page, pageSize),
    retry: RETRIES,
  });
};

export const useEntryDetail = (id: number) => {
  return useQuery({
    queryKey: entriesKeys.detail(id),
    queryFn: () => entriesApi.getById(id),
    retry: RETRIES,
    enabled: !!id,
  });
};

export const useCreateEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntryData) => entriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entriesKeys.all });
    },
  });
};

export const useUpdateEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEntryData }) =>
      entriesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entriesKeys.all });
      queryClient.invalidateQueries({ queryKey: entriesKeys.detail(variables.id) });
    },
  });
};

export const useDeleteEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => entriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entriesKeys.all });
    },
  });
};
