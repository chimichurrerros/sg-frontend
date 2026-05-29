import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import { schedulesApi } from "@/api/schedules.api";
import type {
  ListSchedulesWrapperDto,
  OrganizationQueryDto,
  ScheduleRequestDto,
} from "@/types/organization";

export const scheduleKeys = {
  all: ["schedules"] as const,
};

export const useGetSchedules = (params?: OrganizationQueryDto) => {
  return useQuery<ListSchedulesWrapperDto>({
    queryKey: [
      ...scheduleKeys.all,
      params?.page,
      params?.pageSize,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => schedulesApi.getSchedules(params),
    retry: RETRIES,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ScheduleRequestDto) => schedulesApi.createSchedule(body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Horario creado con éxito" });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ScheduleRequestDto }) =>
      schedulesApi.updateSchedule(id, body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Horario actualizado con éxito" });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulesApi.deleteSchedule(id),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Horario eliminado con éxito" });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};
