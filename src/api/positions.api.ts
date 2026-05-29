import { apiClient } from "./client";
import type {
  ListPositionsWrapperDto,
  OrganizationQueryDto,
  PositionRequestDto,
  PositionWrapperDto,
} from "@/types/organization";

export const positionsApi = {
  getPositions: (params?: OrganizationQueryDto) =>
    apiClient.get<ListPositionsWrapperDto>("/api/positions", { params }).then((response) => response.data),
  createPosition: (body: PositionRequestDto) =>
    apiClient.post<PositionWrapperDto>("/api/positions", body).then((response) => response.data),
  updatePosition: (id: number, body: PositionRequestDto) =>
    apiClient.put<PositionWrapperDto>(`/api/positions/${id}`, body).then((response) => response.data),
  deletePosition: (id: number) =>
    apiClient.delete(`/api/positions/${id}`).then((response) => response.data),
};
