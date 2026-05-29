import { usersApi, type UserRequest } from "@/api/users.api";
import { toaster } from "@/components/ui/toaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usersKeys = {
  users: ["users"] as const,
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: usersKeys.users,
    queryFn: usersApi.getAll,
  })
}

export const useUser = (data: UserRequest) => {
  return useQuery({
    queryKey: [...usersKeys.users, data.id],
    queryFn: () => usersApi.get(data),
  })
}

export const useToggleUserActiveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.toggleActive(id),
    onSuccess: () => {
      toaster.create({
        title: "Estado actualizado",
        description: "El estado del usuario ha sido actualizado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.users });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al actualizar estado",
        description: "Ha ocurrido un error: " + errorMessage,
        type: "error",
      });
    },
  });
};