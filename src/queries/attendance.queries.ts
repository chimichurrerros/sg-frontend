import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import {
  attendanceApi,
  type CreateAttendanceRequestDto,
  type AttendanceResponseDto,
} from "@/api/attendance.api";

export const attendanceKeys = {
  list: (employeeId?: number, year?: number, month?: number) =>
    ["attendance", "list", employeeId, year, month] as const,
};

export const useGetAttendanceList = (
  employeeId?: number,
  year?: number,
  month?: number,
) => {
  return useQuery<AttendanceResponseDto[]>({
    queryKey: attendanceKeys.list(employeeId, year, month),
    queryFn: () =>
      attendanceApi.getList({
        employeeId,
        year: year ?? new Date().getFullYear(),
        month: month ?? new Date().getMonth() + 1,
      }),
    enabled: Boolean(year && month),
    retry: RETRIES,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAttendanceRequestDto) => attendanceApi.create(body),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({ title: "Asistencia registrada con éxito", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: () => {
      toaster.create({ title: "No se pudo registrar la asistencia", type: "error" });
    },
  });
};
