import type { Branch } from "@/types/branches";
import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface BranchesGetResponse {
    branches: Branch[];
    pagination: PaginationType | null;
}

export interface EditBranchRequest {
    name?: string;
    address?: string;
}

export interface BranchResponse {
    branch: Branch
}

export interface CreateBranchRequest{
    name:string;
    address:string;
}
export const branchesApi = {
    getAll: () => apiClient.get<BranchesGetResponse>("/api/branches/all").then((r) => r.data),
    create: (body:CreateBranchRequest) => apiClient.post<BranchResponse>("/api/branches",body).then((r) => r.data),
    edit: (id: number, body: EditBranchRequest) => apiClient.put<BranchResponse>("/api/branches/" + id, body).then((r) => r.data),
    delete: (id: number) => apiClient.delete("/api/branches/" + id).then((r) => r.data)
}


