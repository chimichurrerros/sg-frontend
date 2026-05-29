import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  ButtonGroup,
  createListCollection,
  Field,
  Grid,
  Heading,
  Input,
  Portal,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";
import { useAllBranches } from "@/queries/branches.queries";
import { useGetDepartments } from "@/queries/departments.queries";
import { useGetPositions } from "@/queries/positions.queries";
import { useGetSchedules } from "@/queries/schedules.queries";
import { useAllEmployees, useCreateEmployee, useEditEmployee, useGetEmployee } from "@/queries/employees.queries";
import type { CreateEmployeeRequestDTO, UpdateEmployeeRequestDTO } from "@/api/employees.api";
import { GenderEnum } from "@/types/employees";
import type { DepartmentResponseDto, PositionResponseDto, ScheduleResponseDto } from "@/types/organization";

const employeeSchema = z.object({
  legajo: z.string().min(1, "El legajo es requerido"),
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
  status: z.string().min(1, "El estado es requerido"),
});

type EmployeeFormInput = z.input<typeof employeeSchema>;
type EmployeeFormOutput = z.output<typeof employeeSchema>;

const genders = createListCollection({
  items: [
    { label: "Desconocido", value: String(GenderEnum.Unknown) },
    { label: "Masculino", value: String(GenderEnum.Male) },
    { label: "Femenino", value: String(GenderEnum.Female) },
    { label: "Otro", value: String(GenderEnum.Other) },
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

const statusCollection = createListCollection({
  items: [
    { label: "ACTIVO", value: "ACTIVO" },
    { label: "RECESO", value: "RECESO" },
  ],
});

interface EmployeeFormPageProps {
  basePath?: string;
  breadcrumb?: string;
}

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return value;
};

const normalizeSubmitDate = (value: string) => {
  if (!value) return "";
  if (value.includes("-")) {
    const parts = value.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return value;
};

export default function EmployeeFormPage({
  basePath = "/rrhh/empleados",
  breadcrumb = "RR.HH. / Empleados",
}: EmployeeFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const employeeId = id ? Number(id) : undefined;
  const isEditMode = Boolean(employeeId);

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
          label: `${employee.firstName} ${employee.lastName}`.trim(),
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

  const positionCollection = useMemo(
    () =>
      createListCollection({
        items: (positionsData?.positions ?? []).map((position: PositionResponseDto) => ({
          label: position.name ?? `Cargo #${position.id}`,
          value: String(position.id),
        })),
      }),
    [positionsData],
  );

  const scheduleCollection = useMemo(
    () =>
      createListCollection({
        items: (schedulesData?.schedules ?? []).map((schedule: ScheduleResponseDto) => ({
          label: schedule.name ?? `Horario #${schedule.id}`,
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
    watch,
    formState: { errors },
  } = useForm<EmployeeFormInput, any, EmployeeFormOutput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      legajo: "",
      firstName: "",
      lastName: "",
      documentNumber: "",
      birthDate: "",
      gender: GenderEnum.Male,
      maritalStatus: 1,
      phone: "",
      email: "",
      address: "",
      branchId: null,
      areaId: 1,
      inmediatlyBossId: null,
      positionId: 0,
      scheduleId: 0,
      hireDate: "",
      baseSalary: 0,
      status: "ACTIVO",
    },
  });

  const watchedBirth = watch("birthDate");
  const watchedHire = watch("hireDate");

  useEffect(() => {
    if (!employeeData?.employee) return;

    const employee = employeeData.employee;
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
      status: employee.isActive ? "ACTIVO" : "RECESO",
    });
  }, [employeeData, reset]);

  const onSubmit = (formData: EmployeeFormOutput) => {
    const commonData = {
      fileNumber: formData.legajo.trim(),
      hireDate: normalizeSubmitDate(formData.hireDate),
      areaId: formData.areaId,
      branchId: formData.branchId ?? null,
      inmediatlyBossId: formData.inmediatlyBossId ?? null,
      name: formData.firstName.trim(),
      lastname: formData.lastName.trim(),
      birthDate: normalizeSubmitDate(formData.birthDate),
      gender: formData.gender as import("@/types/employees").GenderEnum,
      maritalStatus: formData.maritalStatus as import("@/types/employees").MaritalStatusEnum,
      documentNumber: formData.documentNumber.trim(),
      email: formData.email?.trim() ? formData.email.trim() : null,
      phone: formData.phone?.trim() ? formData.phone.trim() : null,
      address: formData.address?.trim() ? formData.address.trim() : null,
      isActive: formData.status === "ACTIVO",
    };

    if (isEditMode && employeeId) {
      const requestData: UpdateEmployeeRequestDTO = commonData;
      editEmployee.mutate(
        { id: employeeId, data: requestData },
        {
          onSuccess: () => {
            toaster.create({ title: "Empleado actualizado con éxito" });
            navigate(basePath);
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
      positionStartDate: normalizeSubmitDate(formData.hireDate),
    };

    createEmployee.mutate(requestData, {
      onSuccess: () => {
        toaster.create({ title: "Empleado creado con éxito" });
        navigate(basePath);
      },
    });
  };

  const isPending = createEmployee.isPending || editEmployee.isPending;

  return (
    <Stack gap={6} p={4} maxW="1200px">
      <Stack gap={1}>
        <Text fontSize="sm" color="gray.500">
          {breadcrumb}
        </Text>
        <Heading size="xl">{isEditMode ? "Editar empleado" : "Nuevo empleado"}</Heading>
      </Stack>

      <Stack as="form" onSubmit={handleSubmit(onSubmit)} gap={8}>
        <Stack gap={4}>
          <Heading size="md">Datos Personales</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root invalid={!!errors.firstName}>
              <Field.Label>Nombre <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("firstName")} placeholder="Nombre" disabled={isPending} />
              <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.lastName}>
              <Field.Label>Apellido <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("lastName")} placeholder="Apellido" disabled={isPending} />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.documentNumber}>
              <Field.Label>Cédula de Identidad <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("documentNumber")} placeholder="Número de documento" disabled={isPending} />
              <Field.ErrorText>{errors.documentNumber?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.birthDate}>
              <Field.Label>Fecha de Nacimiento <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="text" placeholder="dd/mm/yyyy" {...register("birthDate")} disabled={isPending} />
              {watchedBirth && <Text fontSize="sm" color="gray.500">{watchedBirth}</Text>}
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
                    disabled={isPending}
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
                    disabled={isPending}
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
              <Input {...register("phone")} placeholder="Teléfono" disabled={isPending} />
            </Field.Root>

            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input {...register("email")} placeholder="correo@dominio.com" disabled={isPending} />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root gridColumn={{ base: "1 / -1", md: "1 / -1" }} invalid={!!errors.address}>
              <Field.Label>Dirección</Field.Label>
              <Input {...register("address")} placeholder="Dirección" disabled={isPending} />
              <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
            </Field.Root>
          </Grid>
        </Stack>

        <Stack gap={4}>
          <Heading size="md">Datos Laborales</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root invalid={!!errors.legajo}>
              <Field.Label>Legajo <Text as="span" color="red.500">*</Text></Field.Label>
              <Input {...register("legajo")} placeholder="Legajo" disabled={isPending} />
              <Field.ErrorText>{errors.legajo?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.branchId}>
              <Field.Label>Sucursal</Field.Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={bossCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(event) => field.onChange(event.value[0] ? Number(event.value[0]) : null)}
                    disabled={isPending}
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
                    disabled={isPending}
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

            <Field.Root invalid={!!errors.inmediatlyBossId}>
              <Field.Label>Jefe inmediato</Field.Label>
              <Controller
                name="inmediatlyBossId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={branchCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(event) => field.onChange(event.value[0] ? Number(event.value[0]) : null)}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar jefe inmediato" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {bossCollection.items.map((item) => (
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

            <Field.Root invalid={!!errors.hireDate}>
              <Field.Label>Fecha de Ingreso <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="text" placeholder="dd/mm/yyyy" {...register("hireDate")} disabled={isPending} />
              {watchedHire && <Text fontSize="sm" color="gray.500">{watchedHire}</Text>}
              <Field.ErrorText>{errors.hireDate?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.status}>
              <Field.Label>Estado <Text as="span" color="red.500">*</Text></Field.Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={statusCollection}
                    value={field.value ? [field.value] : []}
                    onValueChange={(event) => field.onChange(event.value[0])}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar estado" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {statusCollection.items.map((item) => (
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
              <Field.ErrorText>{errors.status?.message}</Field.ErrorText>
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
                        collection={positionCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={isPending}
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
                              {positionCollection.items.map((item) => (
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
                        disabled={isPending}
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
                    disabled={isPending}
                  />
                  <Field.ErrorText>{errors.baseSalary?.message}</Field.ErrorText>
                </Field.Root>
              </>
            )}
          </Grid>
        </Stack>

        <ButtonGroup justifyContent="space-between">
          <Button variant="outline" onClick={() => navigate(basePath)} disabled={isPending}>
            <LuArrowLeft />
            Cancelar
          </Button>
          <Button type="submit" colorPalette="brand" loading={isPending}>
            <LuSave />
            Guardar
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
