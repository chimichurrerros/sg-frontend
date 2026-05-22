import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checksApi, type GetCheckResponse, type CreateCheckBodyRequest, type Check, type UpdateCheckBodyRequest } from "@/api/checks.api";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";

export const checksKeys = {
    checks: ["checks"] as const,
};

export const useGetChecksKeys = (params?: PaginationParams) => {
    return useQuery<GetCheckResponse>({
        queryKey: ["checks", params?.page, params?.pageSize],
        queryFn: () => checksApi.getChecks(params),
        retry: RETRIES
    })
}

export const useCreateCheck = (body: CreateCheckBodyRequest) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => checksApi.createCheck(body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Cheque creado",
                description: "El cheque ha sido creado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: ["checks"] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al crear el cheque",
                description: "Ha ocurrido un error al intentar crear el cheque: " + errorMessage,
                type: "error"
            }); 
        }
    })
}

export const useGetCheckById = (id: number) => {
    return useQuery<Check>({
        queryKey: ["check", id],
        queryFn: () => checksApi.getCheckById(id),
        retry: RETRIES
    });
}

export const useUpdateCheck = (id: number, body: UpdateCheckBodyRequest) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => checksApi.updateCheck(id, body),
        retry: RETRIES,
        onSuccess: () => {
            toaster.create({
                title: "Cheque actualizado",
                description: "El cheque ha sido actualizado exitosamente.",
            });
            queryClient.invalidateQueries({ queryKey: ["checks"] });
            queryClient.invalidateQueries({ queryKey: ["check", id] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.title || error.message;
            toaster.create({
                title: "Error al actualizar el cheque",
                description: "Ha ocurrido un error al intentar actualizar el cheque: " + errorMessage,
                type: "error"
            });
        }
    }
    )
}


