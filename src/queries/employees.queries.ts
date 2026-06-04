import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesApi, type CreateEmployeePositionHistoryRequestDto, type CreateEmployeeRelationRequestDto, type CreateEmployeeRequestDTO, type EmployeeWrapperDto, type ListEmployeePositionHistoriesWrapperDto, type ListEmployeeRelationsWrapperDto, type ListEmployeesWrapperDto, type UpdateEmployeePositionHistoryRequestDto, type UpdateEmployeeRequestDTO } from "@/api/employees.api";
import type {
  Employee,
  EmployeeList,
} from "@/types/employees";
import type { PaginationParams } from "@/types/types";
import { RETRIES } from "@/constants/queryConstants";
import { toaster } from "@/components/ui/toaster";

const mapEmployeeDtoToEmployee = (employee: EmployeeWrapperDto["employee"]): Employee => ({
  id: employee.id,
  legajo: employee.fileNumber ?? "",
  firstName: employee.name ?? "",
  lastName: employee.lastname ?? "",
  documentNumber: employee.documentNumber ?? "",
  areaId: employee.areaId,
  areaName: employee.areaName,
  branchId: employee.branchId,
  inmediatlyBossId: employee.inmediatlyBossId,
  gender: employee.gender,
  maritalStatus: employee.maritalStatus as Employee["maritalStatus"],
  positionId: employee.positionId,
  positionName: employee.positionName,
  scheduleId: employee.scheduleId,
  scheduleName: employee.scheduleName,
  baseSalary: employee.baseSalary ?? 0,
  hireDate: employee.hireDate,
  status: employee.isActive ? "ACTIVO" : "RECESO",
});

export const employeesKeys = {
  all: ["employees"] as const,
  detail: (id: number) => ["employees", id] as const,
  history: (id: number) => ["employees", id, "history"] as const,
  relations: (id: number) => ["employees", id, "relations"] as const,
};

export const useAllEmployees = (params?: PaginationParams) => {
  return useQuery<ListEmployeesWrapperDto, Error, EmployeeList>({
    queryKey: [...employeesKeys.all, params?.page, params?.pageSize],
    queryFn: () => employeesApi.getAllEmployees(params),
    select: (data) => ({
      employees: data.employees.map(mapEmployeeDtoToEmployee),
      pagination: data.pagination,
    }),
    retry: RETRIES,
  });
};

export const useGetEmployee = (id?: number) => {
  return useQuery<EmployeeWrapperDto>({
    queryKey: id ? employeesKeys.detail(id) : ["employees", "none"] as const,
    queryFn: () => employeesApi.getEmployeeById(id ?? 0),
    enabled: Boolean(id),
    retry: RETRIES,
  });
};

export const useGetEmployeeHistory = (id?: number) => {
  return useQuery<ListEmployeePositionHistoriesWrapperDto>({
    queryKey: id ? employeesKeys.history(id) : ["employees", "history", "none"] as const,
    queryFn: () => employeesApi.getEmployeePositionHistory(id ?? 0),
    enabled: Boolean(id),
    retry: RETRIES,
  });
};

export const useGetEmployeeRelations = (id?: number) => {
  return useQuery<ListEmployeeRelationsWrapperDto>({
    queryKey: id ? employeesKeys.relations(id) : ["employees", "relations", "none"] as const,
    queryFn: () => employeesApi.getEmployeeRelations(id ?? 0),
    enabled: Boolean(id),
    retry: RETRIES,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequestDTO) => employeesApi.createEmployee(data),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({
        title: "Empleado creado",
        description: "El empleado se creó correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
};

export const useEditEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequestDTO }) =>
      employeesApi.updateEmployee(id, data),
    retry: RETRIES,
    onSuccess: (_, variables) => {
      toaster.create({
        title: "Empleado actualizado",
        description: "El empleado se actualizó correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: employeesKeys.all });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(variables.id) });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.deleteEmployee(id),
    retry: RETRIES,
    onSuccess: () => {
      toaster.create({
        title: "Empleado eliminado",
        description: "El empleado se eliminó correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
};

export const useCreateEmployeeHistory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeePositionHistoryRequestDto) =>
      employeesApi.createEmployeePositionHistory(id, data),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.history(id) });
    },
  });
};

export const useUpdateEmployeeHistory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ historyId, data }: { historyId: number; data: UpdateEmployeePositionHistoryRequestDto }) =>
      employeesApi.updateEmployeePositionHistory(id, historyId, data),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.history(id) });
    },
  });
};

export const useDeleteEmployeeHistory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (historyId: number) => employeesApi.deleteEmployeePositionHistory(id, historyId),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.history(id) });
    },
  });
};

export const useCreateEmployeeRelation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRelationRequestDto) =>
      employeesApi.createEmployeeRelation(id, data),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.relations(id) });
    },
  });
};

export const useUpdateEmployeeRelation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ relationId, data }: { relationId: number; data: CreateEmployeeRelationRequestDto }) =>
      employeesApi.updateEmployeeRelation(id, relationId, data),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.relations(id) });
    },
  });
};

export const useDeleteEmployeeRelation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relationId: number) =>
      employeesApi.deleteEmployeeRelation(id, relationId),
    retry: RETRIES,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.relations(id) });
    },
  });
};