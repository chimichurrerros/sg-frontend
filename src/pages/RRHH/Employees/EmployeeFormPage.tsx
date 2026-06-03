import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Field,
  Grid,
  Heading,
  HStack,
  Input,
  Portal,
  Select,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuBriefcaseBusiness,
  LuSave,
  LuUsers,
} from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";
import { useAllBranches } from "@/queries/branches.queries";
import { useGetDepartments } from "@/queries/departments.queries";
import { useGetPositions } from "@/queries/positions.queries";
import { useGetSchedules } from "@/queries/schedules.queries";
import {
  useAllEmployees,
  useCreateEmployee,
  useEditEmployee,
  useGetEmployee,
} from "@/queries/employees.queries";
import type {
  CreateEmployeeRequestDTO,
  UpdateEmployeeRequestDTO,
} from "@/api/employees.api";
import type {
  GenderEnum,
  MaritalStatusEnum,
} from "@/types/employees";
import type { DepartmentResponseDto, PositionResponseDto, ScheduleResponseDto } from "@/types/organization";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import { parseApiError } from "@/utils/api-error";

const employeeSchema = z.object({
  legajo: z.string().optional().or(z.literal("")),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  documentNumber: z.string().min(1, "La cédula es requerida"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  gender: z.number().int().min(0).max(3),
  maritalStatus: z.number().int().min(0).max(6),
  phone: z.string().optional(),
  email: z.string().email("Ingrese un correo válido").or(z.literal("")),
  address: z.string().optional(),
  branchId: z.coerce.number().optional().nullable(),
  areaId: z.coerce.number().min(1, "El área es requerida"),
  inmediatlyBossId: z.coerce.number().optional().nullable(),
  positionId: z.coerce.number().min(1, "El cargo es requerido"),
  scheduleId: z.coerce.number().min(1, "El horario es requerido"),
  hireDate: z.string().min(1, "La fecha de ingreso es requerida"),
  baseSalary: z.coerce.number().min(0, "El salario debe ser mayor o igual a 0"),
});

type EmployeeFormInput = z.input<typeof employeeSchema>;
type EmployeeFormOutput = z.output<typeof employeeSchema>;

const genders = createListCollection({
  items: [
    { label: "Desconocido", value: String(0) },
    { label: "Masculino", value: String(1) },
    { label: "Femenino", value: String(2) },
    { label: "Otro", value: String(3) },
  ],
});

const maritalStatuses = createListCollection({
  items: [
    { label: "Desconocido", value: String(0) },
    { label: "Soltero", value: String(1) },
    { label: "Casado", value: String(2) },
    { label: "Divorciado", value: String(3) },
    { label: "Viudo", value: String(4) },
    { label: "Separado", value: String(5) },
    { label: "Convive", value: String(6) },
  ],
});

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return value.slice(0, 10);
};

const toDateInputToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getFullName = (employee?: { name?: string | null; lastname?: string | null; firstName?: string | null; lastName?: string | null } | null) =>
  `${employee?.name ?? employee?.firstName ?? ""} ${employee?.lastname ?? employee?.lastName ?? ""}`.trim();

interface EmployeeFormPageProps {
  basePath?: string;
  breadcrumb?: string;
}

export default function EmployeeFormPage({
  basePath = "/rrhh/empleados",
}: EmployeeFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const employeeId = id ? Number(id) : undefined;
  const isEditMode = Boolean(employeeId);
  const [searchParams] = useSearchParams();
  const isViewMode = isEditMode && searchParams.get("view") === "true";

  const navigateBack = () => {
    if (basePath.startsWith("/gestiones/organizacion/")) {
      navigate("/gestiones/organizacion?tab=employees");
    } else {
      navigate(basePath);
    }
  };

  const { data: employeeData } = useGetEmployee(employeeId);
  const { data: employeesData } = useAllEmployees({ page: 1, pageSize: 100 });
  const { data: branchesData } = useAllBranches();
  const { data: departmentsData } = useGetDepartments({ page: 1, pageSize: 100, sortBy: "name", sortOrder: "asc" });
  const { data: positionsData } = useGetPositions({ page: 1, pageSize: 100, sortBy: "name", sortOrder: "asc" });
  const { data: schedulesData } = useGetSchedules({ page: 1, pageSize: 100, sortBy: "name", sortOrder: "asc" });
  const createEmployee = useCreateEmployee();
  const editEmployee = useEditEmployee();

  const branchCollection = useMemo(
    () =>
      createListCollection({
        items: (branchesData?.branches ?? []).map((branch) => ({
          label: branch.name,
          value: String(branch.id),
        })),
      }),
    [branchesData],
  );

  const bossCollection = useMemo(
    () =>
      createListCollection({
        items: (employeesData?.employees ?? []).map((employee) => ({
          label: getFullName(employee),
          value: String(employee.id),
        })),
      }),
    [employeesData],
  );

  const areaCollection = useMemo(
    () =>
      createListCollection({
        items: (departmentsData?.departments ?? []).map((department: DepartmentResponseDto) => ({
          label: department.name ?? `Área #${department.id}`,
          value: String(department.id),
        })),
      }),
    [departmentsData],
  );


  const scheduleCollection = useMemo(
    () =>
      createListCollection({
        items: (schedulesData?.schedules ?? []).map((schedule: ScheduleResponseDto) => ({
          label: `${schedule.arrivalTime.slice(0, 5)} - ${schedule.departureTime.slice(0, 5)}`,
          value: String(schedule.id),
        })),
      }),
    [schedulesData],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormInput, any, EmployeeFormOutput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      legajo: "",
      firstName: "",
      lastName: "",
      documentNumber: "",
      birthDate: "",
      gender: 1,
      maritalStatus: 1,
      phone: "",
      email: "",
      address: "",
      branchId: null,
      areaId: 1,
      inmediatlyBossId: null,
      positionId: 0,
      scheduleId: 0,
      hireDate: toDateInputToday(),
      baseSalary: 0,
    },
  });

  const employee = employeeData?.employee ?? null;

  useEffect(() => {
    if (!employee) return;

    reset({
      legajo: employee.fileNumber ?? "",
      firstName: employee.name ?? "",
      lastName: employee.lastname ?? "",
      documentNumber: employee.documentNumber ?? "",
      birthDate: toDateInput(employee.birthDate),
      gender: employee.gender,
      maritalStatus: employee.maritalStatus as number,
      phone: employee.phone ?? "",
      email: employee.email ?? "",
      address: employee.address ?? "",
      branchId: employee.branchId,
      areaId: employee.areaId,
      inmediatlyBossId: employee.inmediatlyBossId,
      positionId: employee.positionId ?? 0,
      scheduleId: employee.scheduleId ?? 0,
      hireDate: toDateInput(employee.hireDate),
      baseSalary: employee.baseSalary ?? 0,
    });
  }, [employee, reset]);

  const watchedAreaId = useWatch<EmployeeFormInput>({ control, name: "areaId" });
  const watchedPositionId = useWatch<EmployeeFormInput>({ control, name: "positionId" });

  const filteredPositionCollection = useMemo(
    () =>
      createListCollection({
        items: (positionsData?.positions ?? [])
          .filter((position) =>
            !watchedAreaId ||
            !position.departmentId ||
            position.departmentId === Number(watchedAreaId)
          )
          .map((position) => ({
            label: position.name ?? `Cargo #${position.id}`,
            value: String(position.id),
          })),
      }),
    [positionsData, watchedAreaId],
  );

  const positionSalaryMap = useMemo(
    () => new Map(
      (positionsData?.positions ?? []).map((p) => [p.id, p.defaultBasicSalary]),
    ),
    [positionsData],
  );

  useEffect(() => {
    const posId = Number(watchedPositionId);
    if (posId && positionSalaryMap.has(posId)) {
      setValue("baseSalary", positionSalaryMap.get(posId)!, { shouldValidate: true });
    }
  }, [watchedPositionId, positionSalaryMap, setValue]);

  const onSubmit = (formData: EmployeeFormOutput) => {
    const commonData = {
      fileNumber: formData.legajo?.trim() || undefined,
      hireDate: formData.hireDate,
      areaId: formData.areaId,
      branchId: formData.branchId ?? null,
      inmediatlyBossId: formData.inmediatlyBossId ?? null,
      name: formData.firstName.trim(),
      lastname: formData.lastName.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender as GenderEnum,
      maritalStatus: formData.maritalStatus as MaritalStatusEnum,
      documentNumber: formData.documentNumber.trim(),
      email: formData.email?.trim() ? formData.email.trim() : null,
      phone: formData.phone?.trim() ? formData.phone.trim() : null,
      address: formData.address?.trim() ? formData.address.trim() : null,
      isActive: true,
    };

    if (isEditMode && employeeId) {
      const requestData: UpdateEmployeeRequestDTO = commonData;
      editEmployee.mutate(
        { id: employeeId, data: requestData },
        {
          onSuccess: () => {
            toaster.create({ title: "Empleado actualizado con éxito" });
            navigateBack();
          },
          onError: (error) => {
            const parsed = parseApiError(error as unknown);
            toaster.create({ title: "No se pudo actualizar el empleado", description: parsed.message, type: "error" });
          },
        },
      );
      return;
    }

    const requestData: CreateEmployeeRequestDTO = {
      ...commonData,
      positionId: formData.positionId,
      scheduleId: formData.scheduleId,
      basicSalary: Number(formData.baseSalary),
      positionStartDate: formData.hireDate,
    };

    createEmployee.mutate(requestData, {
      onSuccess: (data) => {
        toaster.create({ title: "Empleado creado", description: `Legajo: ${data.employee.fileNumber}` });
        navigateBack();
      },
      onError: (error) => {
        const parsed = parseApiError(error as unknown);
        toaster.create({ title: "No se pudo crear el empleado", description: parsed.message, type: "error" });
      },
    });
  };

  const isPending = createEmployee.isPending || editEmployee.isPending;
  const formDisabled = isPending || isViewMode;

  return (
    <Stack gap={6} p={4} maxW="1200px">
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Heading size="xl">
          {isViewMode ? "Ver empleado" : isEditMode ? "Editar empleado" : "Nuevo empleado"}
        </Heading>
        {isEditMode && (
          <HStack gap={3}>
            <Button variant="outline" colorPalette="brand" onClick={() => navigate(`${basePath}/${employeeId}/cargos`)}>
              <LuBriefcaseBusiness />
              Cargos
            </Button>
            <Button variant="outline" colorPalette="brand" onClick={() => navigate(`${basePath}/${employeeId}/nucleo-familiar`)}>
              <LuUsers />
              Núcleo Familiar
            </Button>
          </HStack>
        )}
      </HStack>

      <Stack as="form" onSubmit={handleSubmit(onSubmit)} gap={8}>
        <Stack gap={4}>
          <Heading size="md">Datos Personales</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root invalid={!!errors.firstName}>
              <Field.Label>Nombre <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("firstName")} placeholder="Nombre" disabled={formDisabled} />
              <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.lastName}>
              <Field.Label>Apellido <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("lastName")} placeholder="Apellido" disabled={formDisabled} />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.documentNumber}>
              <Field.Label>Cédula de Identidad <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("documentNumber")} placeholder="Número de documento" disabled={formDisabled} />
              <Field.ErrorText>{errors.documentNumber?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.birthDate}>
              <Field.Label>Fecha de Nacimiento <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="date" {...register("birthDate")} disabled={formDisabled} />
              <Field.ErrorText>{errors.birthDate?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.gender}>
              <Field.Label>Género <Text as="span" color="red.500">*</Text></Field.Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={genders}
                    value={[String(field.value)]}
                    onValueChange={(event) => field.onChange(Number(event.value[0]))}
                    disabled={formDisabled}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar género" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {genders.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}
              />
              <Field.ErrorText>{errors.gender?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.maritalStatus}>
              <Field.Label>Estado Civil <Text as="span" color="red.500">*</Text></Field.Label>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={maritalStatuses}
                    value={[String(field.value)]}
                    onValueChange={(event) => field.onChange(Number(event.value[0]))}
                    disabled={formDisabled}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar estado civil" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {maritalStatuses.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}
              />
              <Field.ErrorText>{errors.maritalStatus?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.phone}>
              <Field.Label>Teléfono</Field.Label>
              <Input {...register("phone")} placeholder="Teléfono" disabled={formDisabled} />
            </Field.Root>

            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input {...register("email")} placeholder="correo@dominio.com" disabled={formDisabled} />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root gridColumn={{ base: "1 / -1", md: "1 / -1" }} invalid={!!errors.address}>
              <Field.Label>Dirección</Field.Label>
              <Input {...register("address")} placeholder="Dirección" disabled={formDisabled} />
              <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
            </Field.Root>
          </Grid>
        </Stack>

        <Stack gap={4}>
          <Heading size="md">Datos Laborales</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root invalid={!!errors.legajo}>
              <Field.Label>Legajo <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("legajo")} placeholder="Legajo" disabled={formDisabled} />
              <Field.ErrorText>{errors.legajo?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.branchId}>
              <Field.Label>Sucursal</Field.Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={branchCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(event) => field.onChange(event.value[0] ? Number(event.value[0]) : null)}
                    disabled={formDisabled}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar sucursal" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {branchCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}
              />
            </Field.Root>

            <Field.Root invalid={!!errors.areaId}>
              <Field.Label>Área <Text as="span" color="red.500">*</Text></Field.Label>
              <Controller
                name="areaId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={areaCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(event) => field.onChange(Number(event.value[0]))}
                    disabled={formDisabled}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar área" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {areaCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}
              />
              <Field.ErrorText>{errors.areaId?.message}</Field.ErrorText>
            </Field.Root>

            <Controller
              name="inmediatlyBossId"
              control={control}
              render={({ field }) => (
                <ComboboxWrapper
                  label="Jefe inmediato"
                  placeholder="Buscar jefe inmediato..."
                  options={bossCollection.items}
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                  disabled={formDisabled}
                  clearable
                  onClear={() => field.onChange(null)}
                />
              )}
            />

            <Field.Root invalid={!!errors.hireDate}>
              <Field.Label>Fecha de Ingreso <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="date" {...register("hireDate")} disabled={formDisabled} />
              <Field.ErrorText>{errors.hireDate?.message}</Field.ErrorText>
            </Field.Root>

            {!isEditMode && (
              <>
                <Field.Root invalid={!!errors.positionId}>
                  <Field.Label>Cargo <Text as="span" color="red.500">*</Text></Field.Label>
                  <Controller
                    name="positionId"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        collection={filteredPositionCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={formDisabled}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Seleccionar cargo" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content>
                              {filteredPositionCollection.items.map((item) => (
                                <Select.Item item={item} key={item.value}>
                                  {item.label}
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Portal>
                      </Select.Root>
                    )}
                  />
                  <Field.ErrorText>{errors.positionId?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.scheduleId}>
                  <Field.Label>Horario <Text as="span" color="red.500">*</Text></Field.Label>
                  <Controller
                    name="scheduleId"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        collection={scheduleCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={formDisabled}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Seleccionar horario" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content>
                              {scheduleCollection.items.map((item) => (
                                <Select.Item item={item} key={item.value}>
                                  {item.label}
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Portal>
                      </Select.Root>
                    )}
                  />
                  <Field.ErrorText>{errors.scheduleId?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.baseSalary}>
                  <Field.Label>Salario Base <Text as="span" color="red.500">*</Text></Field.Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    {...register("baseSalary", { valueAsNumber: true })}
                    placeholder="0"
                    disabled={formDisabled}
                  />
                  <Field.ErrorText>{errors.baseSalary?.message}</Field.ErrorText>
                </Field.Root>
              </>
            )}
          </Grid>
        </Stack>

        <ButtonGroup justifyContent="space-between">
          <Button variant="outline" onClick={navigateBack} disabled={isPending}>
            <LuArrowLeft />
            Cancelar
          </Button>
          {isViewMode ? (
            <Button colorPalette="brand" onClick={navigateBack}>
              Cerrar
            </Button>
          ) : (
            <Button type="submit" colorPalette="brand" loading={isPending}>
              <LuSave />
              Guardar
            </Button>
          )}
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
