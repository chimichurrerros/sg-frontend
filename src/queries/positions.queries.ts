import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import { positionsApi } from "@/api/positions.api";
import type {
  ListPositionsWrapperDto,
  OrganizationQueryDto,
  PositionRequestDto,
} from "@/types/organization";

export const positionKeys = {
  all: ["positions"] as const,
};

export const useGetPositions = (params?: OrganizationQueryDto) => {
  return useQuery<ListPositionsWrapperDto>({
    queryKey: [
      ...positionKeys.all,
      params?.page,
      params?.pageSize,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => positionsApi.getPositions(params),
    retry: RETRIES,
  });
};

export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PositionRequestDto) => positionsApi.createPosition(body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Cargo creado con éxito" });
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PositionRequestDto }) =>
      positionsApi.updatePosition(id, body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Cargo actualizado con éxito" });
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
  });
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionsApi.deletePosition(id),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Cargo eliminado con éxito" });
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
  });
};
