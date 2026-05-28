import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { parseDate } from "@/constants/date";
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
import { useGetBanks } from "@/queries/banks.queries";
import { employeesKeys, useCreateEmployee, useEditEmployee, useGetEmployee } from "@/queries/employees.queries";
import type { CreateEmployeeRequestDTO, CreateEmployeeRelationRequestDto } from "@/types/employees";
import { employeesApi } from "@/api/employees.api";

const employeeSchema = z.object({
  legajo: z.string().min(1, "El legajo es requerido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  documentNumber: z.string().min(1, "La cédula es requerida"),
  birthDate: z.string().optional(),
  gender: z.string().min(1, "El género es requerido"),
  maritalStatus: z.string().min(1, "El estado civil es requerido"),
  phone: z.string().optional(),
  email: z.string().email("Ingrese un correo válido").or(z.literal("")),
  address: z.string().optional(),
  branchId: z.coerce.number().min(1, "La sucursal es requerida"),
  area: z.string().min(1, "El área es requerida"),
  position: z.string().min(1, "El cargo es requerido"),
  schedule: z.string().min(1, "El horario es requerido"),
  bankId: z.coerce.number().optional().nullable(),
  bankAccountNumber: z.string().optional(),
  hireDate: z.string().min(1, "La fecha de ingreso es requerida"),
  baseSalary: z.coerce.number().min(0, "El salario debe ser mayor o igual a 0"),
  status: z.string().min(1, "El estado es requerido"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const genders = createListCollection({
  items: [
    { label: "Masculino", value: "MASCULINO" },
    { label: "Femenino", value: "FEMENINO" },
    { label: "Otro", value: "OTRO" },
  ],
});

const maritalStatuses = createListCollection({
  items: [
    { label: "Soltero", value: "SOLTERO" },
    { label: "Casado", value: "CASADO" },
    { label: "Divorciado", value: "DIVORCIADO" },
    { label: "Viudo", value: "VIUDO" },
    { label: "Unión libre", value: "UNION_LIBRE" },
  ],
});

const areas = createListCollection({
  items: [
    { label: "VENTAS", value: "VENTAS" },
    { label: "ADMINISTRACIÓN", value: "ADMINISTRACIÓN" },
    { label: "INFORMÁTICA", value: "INFORMÁTICA" },
    { label: "AUDITORÍA", value: "AUDITORÍA" },
  ],
});

const positions = createListCollection({
  items: [
    { label: "VENDEDOR", value: "VENDEDOR" },
    { label: "CAJERO", value: "CAJERO" },
    { label: "TÉCNICO", value: "TÉCNICO" },
    { label: "AUDITOR", value: "AUDITOR" },
    { label: "ENCARGADO", value: "ENCARGADO" },
  ],
});

const schedules = createListCollection({
  items: [
    { label: "DIURNO 07:00-15:00", value: "DIURNO 07:00-15:00" },
    { label: "VESPERTINO 13:00-21:00", value: "VESPERTINO 13:00-21:00" },
    { label: "NOCTURNO 21:00-05:00", value: "NOCTURNO 21:00-05:00" },
  ],
});

const statuses = createListCollection<{ label: string; value: string }>({
  items: [
    { label: "ACTIVO", value: "ACTIVO" },
    { label: "RECESO", value: "RECESO" },
  ],
});

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const employeeId = id ? Number(id) : undefined;
  const isEditMode = Boolean(employeeId);

  const { data: employeeData } = useGetEmployee(employeeId);
  const { data: branchesData } = useAllBranches();
  const { data: banksData } = useGetBanks({ page: 1, pageSize: 100 });
  const createEmployee = useCreateEmployee();
  const editEmployee = useEditEmployee();
  const [formError, setFormError] = useState<string | null>(null);
  const [showFamily, setShowFamily] = useState(false);
  const [familyRelations, setFamilyRelations] = useState<CreateEmployeeRelationRequestDto[]>([]);
  const [newRelation, setNewRelation] = useState<CreateEmployeeRelationRequestDto>({
    relationType: 1,
    name: "",
    lastname: "",
    documentNumber: "",
    birthDate: "",
    startDate: "",
    endDate: null,
  });

  const addRelation = () => {
    // basic validation
    if (!newRelation.name || !newRelation.lastname) return;
    setFamilyRelations((s) => [...s, newRelation]);
    setNewRelation({ relationType: 1, name: "", lastname: "", documentNumber: "", birthDate: "", startDate: "", endDate: null });
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    // accept yyyy-mm-dd or dd/mm/yyyy
    if (iso.includes("-")) {
      const parts = iso.split("-");
      if (parts.length !== 3) return iso;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (iso.includes("/")) {
      const parts = iso.split("/");
      if (parts.length !== 3) return iso;
      // assume already dd/mm/yyyy
      return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`;
    }
    return iso;
  };

  const displayDate = (value?: string | null) => {
    if (!value) return "";
    if (value.includes("/")) return value;
    return parseDate(value);
  };

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

  const bankCollection = useMemo(
    () =>
      createListCollection({
        items: (banksData?.banks ?? [])
          .filter((bank): bank is NonNullable<typeof bank> => Boolean(bank))
          .map((bank) => ({
            label: bank.name ?? `Banco #${bank.id}`,
            value: String(bank.id),
          })),
      }),
    [banksData],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      legajo: "",
      firstName: "",
      lastName: "",
      documentNumber: "",
      birthDate: "",
      gender: "MASCULINO",
      maritalStatus: "SOLTERO",
      phone: "",
      email: "",
      address: "",
      branchId: 0,
      area: "VENTAS",
      position: "VENDEDOR",
      schedule: "DIURNO 07:00-15:00",
      bankId: null,
      bankAccountNumber: "",
      hireDate: "",
      baseSalary: 0,
      status: "ACTIVO",
    },
  });

  const watchedBirth = watch("birthDate");
  const watchedHire = watch("hireDate");

  useEffect(() => {
    if (employeeData?.employee) {
      const employee = employeeData.employee;

      reset({
        legajo: employee.fileNumber ?? "",
        firstName: employee.name ?? "",
        lastName: employee.lastname ?? "",
        documentNumber: employee.documentNumber ?? "",
        birthDate: (() => {
          // try backend formats: yyyy-mm-dd or dd/MM/yyyy -> convert to yyyy-mm-dd for input
          const val = employee.birthDate ?? "";
          if (!val) return "";
          if (val.includes("/")) {
            const [d, m, y] = val.split("/");
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          }
          return val;
        })(),
        gender: employee.genderId === 2 ? "FEMENINO" : employee.genderId === 3 ? "OTRO" : "MASCULINO",
        maritalStatus: (() => {
          switch (employee.maritalStatus) {
            case 1:
              return "CASADO";
            case 2:
              return "DIVORCIADO";
            case 3:
              return "VIUDO";
            case 4:
              return "UNION_LIBRE";
            default:
              return "SOLTERO";
          }
        })(),
        phone: employee.phone ?? "",
        email: employee.email ?? "",
        address: employee.address ?? "",
        branchId: employee.branchId ?? 0,
        area: employee.area?.name ?? "VENTAS",
        position: employee.positionId ? String(employee.positionId) : "VENDEDOR",
        schedule: employee.scheduleId ? String(employee.scheduleId) : "DIURNO 07:00-15:00",
        bankId: employee.bankId,
        bankAccountNumber: employee.bankAccountNumber ?? "",
        hireDate: (() => {
          const val = employee.hireDate ?? "";
          if (!val) return "";
          if (val.includes("/")) {
            const [d, m, y] = val.split("/");
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          }
          return val;
        })(),
        baseSalary: employee.baseSalary ?? 0,
        status: employee.isActive ? "ACTIVO" : "RECESO",
      });
    }
  }, [employeeData, reset]);

  const onSubmit = (formData: EmployeeFormData) => {
    setFormError(null);

    // small mappings from UI labels to numeric IDs expected by backend
    const genderMap: Record<string, number> = { MASCULINO: 1, FEMENINO: 2, OTRO: 3 };
    const maritalMap: Record<string, number> = { SOLTERO: 0, CASADO: 1, DIVORCIADO: 2, VIUDO: 3, UNION_LIBRE: 4 };
    const areaMap: Record<string, number> = { VENTAS: 1, "ADMINISTRACIÓN": 2, INFORMÁTICA: 3, AUDITORÍA: 4 };
    const positionMap: Record<string, number> = { VENDEDOR: 1, CAJERO: 2, "TÉCNICO": 3, AUDITOR: 4, ENCARGADO: 5 };
    const scheduleMap: Record<string, number> = {
      "DIURNO 07:00-15:00": 1,
      "VESPERTINO 13:00-21:00": 2,
      "NOCTURNO 21:00-05:00": 3,
    };

    const requestData: CreateEmployeeRequestDTO = {
      fileNumber: formData.legajo.trim(),
      hireDate: formatDate(formData.hireDate),
      areaId: areaMap[formData.area] ?? 0,
      branchId: formData.branchId ?? null,
      inmediatlyBossId: null,
      positionId: positionMap[formData.position] ?? 0,
      scheduleId: scheduleMap[formData.schedule] ?? 0,
      basicSalary: Number(formData.baseSalary),
      positionStartDate: formatDate(formData.hireDate),
      name: formData.firstName.trim(),
      lastname: formData.lastName.trim(),
      birthDate: formatDate(formData.birthDate ?? ""),
      genderId: genderMap[formData.gender] ?? 0,
      maritalStatus: (maritalMap[formData.maritalStatus] ?? 0) as any,
      documentNumber: formData.documentNumber.trim(),
      email: formData.email?.trim() ? formData.email.trim() : null,
      phone: formData.phone?.trim() ? formData.phone.trim() : null,
      address: formData.address?.trim() ? formData.address.trim() : null,
      isActive: formData.status === "ACTIVO",
    };

    if (isEditMode && employeeId) {
      editEmployee.mutate(
        { id: employeeId, data: requestData },
        {
          onSuccess: () => {
            toaster.create({ title: "Empleado actualizado con éxito" });
            queryClient.invalidateQueries({ queryKey: employeesKeys.all });
            navigate("/rrhh/empleados");
          },
          onError: (mutationError) => {
            setFormError(
              mutationError instanceof Error
                ? mutationError.message
                : "No se pudo actualizar el empleado",
            );
          },
        },
      );
      return;
    }

    createEmployee.mutate(requestData, {
      onSuccess: async (data) => {
        try {
          const createdId = data?.employee?.id;
          // if we have family relations, send them after creation
          if (createdId && familyRelations.length > 0) {
            await Promise.all(
              familyRelations.map((rel) =>
                employeesApi.createEmployeeRelation(createdId, {
                  ...rel,
                  birthDate: formatDate(rel.birthDate),
                  startDate: formatDate(rel.startDate),
                  endDate: rel.endDate ? formatDate(rel.endDate) : null,
                }),
              ),
            );
          }
          toaster.create({ title: "Empleado creado con éxito" });
          queryClient.invalidateQueries({ queryKey: employeesKeys.all });
          navigate("/rrhh/empleados");
        } catch (err) {
          setFormError(err instanceof Error ? err.message : "Error al crear relaciones");
        }
      },
      onError: (mutationError) => {
        setFormError(
          mutationError instanceof Error ? mutationError.message : "No se pudo crear el empleado",
        );
      },
    });
  };

  const isPending = createEmployee.isPending || editEmployee.isPending;

  return (
    <Stack gap={6} p={4} maxW="1200px">
      <Stack gap={1}>
        <Text fontSize="sm" color="gray.500">
          RR.HH. / Empleados
        </Text>
        <Heading size="xl">
          {isEditMode ? "Editar empleado" : "Nuevo empleado"}
        </Heading>
      </Stack>

      <ButtonGroup justifyContent="flex-end">
        <Button variant="outline" colorPalette="brand">
          Datos Laborales
        </Button>
        <Button variant="surface" colorPalette="gray" onClick={() => setShowFamily((s) => !s)}>
          Núcleo Familiar
        </Button>
      </ButtonGroup>

      <Stack as="form" onSubmit={handleSubmit(onSubmit)} gap={8}>
        <Stack gap={4}>
          <Heading size="md">Datos Personales</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root invalid={!!errors.firstName}>
              <Field.Label>
                Nombre <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input {...register("firstName")} placeholder="Nombre" disabled={isPending} />
              <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.lastName}>
              <Field.Label>
                Apellido <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input {...register("lastName")} placeholder="Apellido" disabled={isPending} />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.documentNumber}>
              <Field.Label>
                Cédula de Identidad <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input
                {...register("documentNumber")}
                placeholder="Número de documento"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.documentNumber?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.birthDate}>
              <Field.Label>
                Fecha de Nacimiento <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input type="text" placeholder="dd/mm/yyyy" {...register("birthDate")} disabled={isPending} />
              {watchedBirth && (
                <Text fontSize="sm" color="gray.500">{displayDate(watchedBirth)}</Text>
              )}
              <Field.ErrorText>{errors.birthDate?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.gender}>
              <Field.Label>
                Género <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={genders}
                    value={field.value ? [field.value] : []}
                    onValueChange={(event) => field.onChange(event.value[0])}
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
              <Field.Label>
                Estado Civil <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={maritalStatuses}
                    value={field.value ? [field.value] : []}
                    onValueChange={(event) => field.onChange(event.value[0])}
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
              <Field.Label>
                Teléfono <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input {...register("phone")} placeholder="Teléfono" disabled={isPending} />
              <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.email}>
              <Field.Label>
                Email <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input {...register("email")} placeholder="correo@dominio.com" disabled={isPending} />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root gridColumn={{ base: "1 / -1", md: "1 / -1" }} invalid={!!errors.address}>
              <Field.Label>
                Dirección <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input {...register("address")} placeholder="Dirección" disabled={isPending} />
              <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
            </Field.Root>
          </Grid>
        </Stack>

        {showFamily && (
          <Stack gap={4}>
            <Heading size="md">Núcleo Familiar</Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
              <Field.Root>
                <Field.Label>Tipo</Field.Label>
                <Select onChange={(e) => setNewRelation({ ...newRelation, relationType: Number(e.target.value) })} value={String(newRelation.relationType)}>
                  <option value="1">Cónyuge</option>
                  <option value="2">Hijo/a</option>
                </Select>
              </Field.Root>

              <Field.Root>
                <Field.Label>Nombre</Field.Label>
                <Input value={newRelation.name} onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Apellido</Field.Label>
                <Input value={newRelation.lastname} onChange={(e) => setNewRelation({ ...newRelation, lastname: e.target.value })} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Cédula</Field.Label>
                <Input value={newRelation.documentNumber} onChange={(e) => setNewRelation({ ...newRelation, documentNumber: e.target.value })} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Fecha de Nacimiento</Field.Label>
                <Input type="date" value={newRelation.birthDate} onChange={(e) => setNewRelation({ ...newRelation, birthDate: e.target.value })} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Inicio</Field.Label>
                <Input type="date" value={newRelation.startDate} onChange={(e) => setNewRelation({ ...newRelation, startDate: e.target.value })} />
              </Field.Root>
            </Grid>

            <Button onClick={addRelation} colorPalette="brand">Agregar Miembro</Button>

            {familyRelations.length > 0 && (
              <Stack>
                <Heading size="sm">Miembros agregados</Heading>
                {familyRelations.map((r, idx) => (
                  <Text key={idx}>{`${r.name} ${r.lastname} (${r.relationType === 1 ? 'Cónyuge' : 'Hijo/a'}) — Nac: ${displayDate(r.birthDate)} — Inicio: ${displayDate(r.startDate)}`}</Text>
                ))}
              </Stack>
            )}
          </Stack>
        )}

        <Stack gap={4}>
          <Heading size="md">Datos Laborales</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Field.Root invalid={!!errors.legajo}>
              <Field.Label>
                Legajo <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input {...register("legajo")} placeholder="Legajo" disabled={isPending} />
              <Field.ErrorText>{errors.legajo?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.branchId}>
              <Field.Label>
                Sucursal <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={branchCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(event) => field.onChange(Number(event.value[0]))}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar sucursal" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
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
              <Field.ErrorText>{errors.branchId?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.area}>
              <Field.Label>
                Área <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={areas}
                    value={field.value ? [field.value] : []}
                    onValueChange={(event) => field.onChange(event.value[0])}
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
                          {areas.items.map((item) => (
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
              <Field.ErrorText>{errors.area?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.position}>
              <Field.Label>
                Cargo <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={positions}
                    value={field.value ? [field.value] : []}
                    onValueChange={(event) => field.onChange(event.value[0])}
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
                          {positions.items.map((item) => (
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
              <Field.ErrorText>{errors.position?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.schedule}>
              <Field.Label>
                Horario <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="schedule"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={schedules}
                    value={field.value ? [field.value] : []}
                    onValueChange={(event) => field.onChange(event.value[0])}
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
                          {schedules.items.map((item) => (
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
              <Field.ErrorText>{errors.schedule?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.hireDate}>
              <Field.Label>
                Fecha de Ingreso <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input type="text" placeholder="dd/mm/yyyy" {...register("hireDate")} disabled={isPending} />
              {watchedHire && (
                <Text fontSize="sm" color="gray.500">{displayDate(watchedHire)}</Text>
              )}
              <Field.ErrorText>{errors.hireDate?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.baseSalary}>
              <Field.Label>
                Salario Base <Text as="span" color="red.500">*</Text>
              </Field.Label>
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

            <Field.Root invalid={!!errors.status}>
              <Field.Label>
                Estado <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={statuses}
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
                          {statuses.items.map((item) => (
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

            <Field.Root>
              <Field.Label>Entidad Bancaria</Field.Label>
              <Controller
                name="bankId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={bankCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(event) =>
                      field.onChange(event.value[0] ? Number(event.value[0]) : null)
                    }
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar banco" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {bankCollection.items.map((item) => (
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

            <Field.Root>
              <Field.Label>Número de Cuenta</Field.Label>
              <Input
                {...register("bankAccountNumber")}
                placeholder="Número de cuenta"
                disabled={isPending}
              />
            </Field.Root>
          </Grid>
        </Stack>

        <Stack gap={3}>
          {formError && (
            <Text color="red.500" fontSize="sm">
              {formError}
            </Text>
          )}

          <ButtonGroup justifyContent="space-between">
            <Button variant="outline" onClick={() => navigate("/rrhh/empleados")} disabled={isPending}>
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
    </Stack>
  );
}