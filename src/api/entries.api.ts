import { apiClient } from "./client";
import type { ListEntriesWrapper, EntryWrapper, EntryDetail } from "@/types/entries";

export interface CreateEntryData {
  date: string;
  description: string | null;
  module: number;
  accountantProcessId: number;
  entryDetails: Omit<EntryDetail, "id" | "entryId">[];
}

export interface UpdateEntryData {
  date: string;
  description: string | null;
  module: number;
  accountantProcessId: number;
  entryDetails: Omit<EntryDetail, "id" | "entryId">[];
}

export const entriesApi = {
  getAll: () =>
    apiClient
      .get<ListEntriesWrapper>("/api/entries/all")
      .then((r) => r.data),
  getList: (page: number, pageSize: number) =>
    apiClient
      .get<ListEntriesWrapper>("/api/entries", {
        params: { page, pageSize },
      })
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient
      .get<EntryWrapper>(`/api/entries/${id}`)
      .then((r) => r.data),
  create: (data: CreateEntryData) =>
    apiClient
      .post<EntryWrapper>("/api/entries", data)
      .then((r) => r.data),
  update: (id: number, data: UpdateEntryData) =>
    apiClient
      .put<EntryWrapper>(`/api/entries/${id}`, data)
      .then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`/api/entries/${id}`).then((r) => r.data),
};
