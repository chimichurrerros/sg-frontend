import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi, type RoleRequest, type SyncRolePermissionsRequest } from "@/api/roles.api";
import { toaster } from "@/components/ui/toaster";

export const rolesKeys = {
  all: ["roles"] as const,
  detail: (id: number) => ["roles", id] as const,
};

export const useAllRoles = () => {
  return useQuery({
    queryKey: rolesKeys.all,
    queryFn: rolesApi.getAll,
  });
};

export const useRoleDetails = (id: number) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleRequest) => rolesApi.create(data),
    onSuccess: (res) => {
      toaster.create({
        title: "Rol creado",
        description: `El rol "${res.role.name}" ha sido creado con éxito.`,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al crear rol",
        description: "Ha ocurrido un error: " + errorMessage,
        type: "error",
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleRequest }) =>
      rolesApi.update(id, data),
    onSuccess: (res) => {
      toaster.create({
        title: "Rol actualizado",
        description: `El rol ha sido renombrado a "${res.role.name}".`,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(res.role.id) });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al actualizar rol",
        description: "Ha ocurrido un error: " + errorMessage,
        type: "error",
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      toaster.create({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado con éxito.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al eliminar rol",
        description: errorMessage,
        type: "error",
      });
    },
  });
};

export const useSyncRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SyncRolePermissionsRequest }) =>
      rolesApi.syncPermissions(id, data),
    onSuccess: (res) => {
      toaster.create({
        title: "Permisos sincronizados",
        description: `Los permisos del rol "${res.role.name}" se actualizaron con éxito.`,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(res.role.id) });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title || error.message;
      toaster.create({
        title: "Error al sincronizar permisos",
        description: "Ha ocurrido un error: " + errorMessage,
        type: "error",
      });
    },
  });
};
