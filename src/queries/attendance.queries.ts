import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";
import {
  attendanceApi,
  type CreateAttendanceRequestDto,
  type AttendanceResponseDto,
} from "@/api/attendance.api";

export const useGetAttendanceList = (
  employeeId?: number,
  fromDate?: string,
  toDate?: string,
) => {
  return useQuery<AttendanceResponseDto[]>({
    queryKey: ["attendance", "list", employeeId, fromDate, toDate],
    queryFn: () =>
      attendanceApi.getList({
        fromDate,
        toDate,
        employeeId,
      }),
    enabled: Boolean(fromDate && toDate),
    retry: RETRIES,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAttendanceRequestDto) => attendanceApi.create(body),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};
