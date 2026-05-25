import { customerApi,  type CustomerRequest } from "@/api/customers.api";
import { RETRIES } from "@/constants/queryConstants";
import type { PaginationParams } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const useGetCustomers = (params: PaginationParams) => {
    return useQuery({
        queryKey: ["customers", params.page, params.pageSize],
        queryFn: () => customerApi.get(params),
        retry: RETRIES
    });
};

export const useGetCustomerById = (id: number) => {
    return useQuery({
        queryKey: ["customers", id],
        queryFn: () => customerApi.getById(id),
        retry: RETRIES
    });
};

export const useGetAllCustomers = () => {
    return useQuery({
        queryKey: ["customers", "all"],
        queryFn: () => customerApi.getAll(),
        retry: RETRIES
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CustomerRequest) => customerApi.create(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        }
    });
};

export const useEditCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: CustomerRequest }) =>
            customerApi.edit(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        }
    });
};