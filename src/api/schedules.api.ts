import { apiClient } from "./client";
import type {
  ListSchedulesWrapperDto,
  OrganizationQueryDto,
  ScheduleRequestDto,
  ScheduleWrapperDto,
} from "@/types/organization";

export const schedulesApi = {
  getSchedules: (params?: OrganizationQueryDto) =>
    apiClient.get<ListSchedulesWrapperDto>("/api/schedules", { params }).then((response) => response.data),
  createSchedule: (body: ScheduleRequestDto) =>
    apiClient.post<ScheduleWrapperDto>("/api/schedules", body).then((response) => response.data),
  updateSchedule: (id: number, body: ScheduleRequestDto) =>
    apiClient.put<ScheduleWrapperDto>(`/api/schedules/${id}`, body).then((response) => response.data),
  deleteSchedule: (id: number) =>
    apiClient.delete(`/api/schedules/${id}`).then((response) => response.data),
};
