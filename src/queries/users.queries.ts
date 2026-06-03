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

export const useUser = (id: string | number | undefined) => {
  return useQuery({
    queryKey: [...usersKeys.users, String(id)],
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  });
};

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

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      usersApi.update(id, data),
    onSuccess: (res) => {
      toaster.create({
        title: "Usuario actualizado",
        description: `El usuario "${res.user.name} ${res.user.lastName}" ha sido actualizado con éxito.`,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.users });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al actualizar usuario",
        description: "Ha ocurrido un error: " + errorMessage,
        type: "error",
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: number; roleId: number }) =>
      usersApi.updateRole(id, roleId),
    onSuccess: (res) => {
      toaster.create({
        title: "Rol de usuario actualizado",
        description: `El rol de "${res.user.name}" ha sido actualizado a "${res.user.roleName}".`,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.users });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al actualizar rol de usuario",
        description: "Ha ocurrido un error: " + errorMessage,
        type: "error",
      });
    },
  });
};