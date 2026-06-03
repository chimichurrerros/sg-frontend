
import { branchesApi, type CreateBranchRequest, type EditBranchRequest } from "@/api/branches.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const branchesKeys = {
    branches: ["branches"] as const,
};

const RETRIES = 2;
export const useAllBranches = () => {
    return useQuery({
        queryKey: branchesKeys.branches,
        queryFn: branchesApi.getAll,
        retry: RETRIES
    })
}

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateBranchRequest) => branchesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: branchesKeys.branches })
        },
        retry: RETRIES
    })
}

export const useEditBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EditBranchRequest }) =>
            branchesApi.edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: branchesKeys.branches })
        },
        retry: RETRIES
    })
}

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => branchesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: branchesKeys.branches })
        },
        retry: RETRIES
    }
    )
}