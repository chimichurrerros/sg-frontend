import { apiClient } from "./client";
import type { ListAccountPlansWrapper, AccountPlanWrapper } from "@/types/accountPlans";

export interface CreateAccountPlanData {
  code: string;
  name: string;
  order: number;
  parentId: number | null;
  isAcceptor: boolean;
  accountantProcessId: number;
}

export interface UpdateAccountPlanData {
  code: string;
  name: string;
  order: number;
  parentId: number | null;
  isAcceptor: boolean;
  accountantProcessId: number;
}

export const accountPlansApi = {
  getAll: () =>
    apiClient
      .get<ListAccountPlansWrapper>("/api/account-plans/all")
      .then((r) => r.data),
  getList: (page: number, pageSize: number) =>
    apiClient
      .get<ListAccountPlansWrapper>("/api/account-plans", {
        params: { page, pageSize },
      })
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient
      .get<AccountPlanWrapper>(`/api/account-plans/${id}`)
      .then((r) => r.data),
  create: (data: CreateAccountPlanData) =>
    apiClient
      .post<AccountPlanWrapper>("/api/account-plans", data)
      .then((r) => r.data),
  update: (id: number, data: UpdateAccountPlanData) =>
    apiClient
      .put<AccountPlanWrapper>(`/api/account-plans/${id}`, data)
      .then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`/api/account-plans/${id}`).then((r) => r.data),
};
