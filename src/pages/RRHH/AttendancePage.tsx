import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  createListCollection,
  Field,
  Grid,
  Heading,
  HStack,
  Portal,
  Select,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import { useAllEmployees } from "@/queries/employees.queries";
import {
  useCreateAttendance,
  useGetAttendanceList,
} from "@/queries/attendance.queries";
import { parseApiError } from "@/utils/api-error";

const AttendanceStatusEnum = {
  Present: 1,
  Absent: 2,
  Late: 3,
  ExcusedAbsence: 4,
  ExcusedLate: 5,
} as const;

const statusCollection = createListCollection({
  items: [
    { label: "Presente", value: "1" },
    { label: "Ausente", value: "2" },
    { label: "Llegada Tardía", value: "3" },
    { label: "Ausencia Justificada", value: "4" },
    { label: "Llegada Tardía Justificada", value: "5" },
  ],
});

const statusColorMap: Record<number, string> = {
  [AttendanceStatusEnum.Present]: "green",
  [AttendanceStatusEnum.Absent]: "red",
  [AttendanceStatusEnum.Late]: "orange",
  [AttendanceStatusEnum.ExcusedAbsence]: "blue",
  [AttendanceStatusEnum.ExcusedLate]: "yellow",
};

const statusLabelMap: Record<number, string> = {
  [AttendanceStatusEnum.Present]: "Presente",
  [AttendanceStatusEnum.Absent]: "Ausente",
  [AttendanceStatusEnum.Late]: "Llegada Tardía",
  [AttendanceStatusEnum.ExcusedAbsence]: "Ausencia Justificada",
  [AttendanceStatusEnum.ExcusedLate]: "Llegada Tardía Justificada",
};

const attendanceSchema = z.object({
  employeeId: z.coerce.number().min(1, "El empleado es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  status: z.coerce.number().min(1, "El estado es requerido"),
});

type AttendanceFormInput = z.input<typeof attendanceSchema>;

function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const navigate = useNavigate();
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<number>(0);

  const employeesQuery = useAllEmployees();
  const createAttendance = useCreateAttendance();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const attendanceListQuery = useGetAttendanceList(
    selectedEmployeeFilter || undefined,
    currentYear,
    currentMonth,
  );

  const employees = useMemo(
    () => employeesQuery.data?.employees ?? [],
    [employeesQuery.data],
  );

  const attendances = useMemo(
    () => attendanceListQuery.data ?? [],
    [attendanceListQuery.data],
  );

  const employeeCollection = useMemo(
    () =>
      createListCollection({
        items: employees.map((e) => ({
          label: `${e.firstName} ${e.lastName}`.trim(),
          value: String(e.id),
        })),
      }),
    [employees],
  );

  const employeeFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todos los empleados", value: "" },
          ...employees.map((e) => ({
            label: `${e.firstName} ${e.lastName}`.trim(),
            value: String(e.id),
          })),
        ],
      }),
    [employees],
  );

  const form = useForm<AttendanceFormInput>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: 0,
      date: getTodayString(),
      status: AttendanceStatusEnum.Present,
    },
  });

  const handleRegister = (values: AttendanceFormInput) => {
    createAttendance.mutate(
      {
        employeeId: values.employeeId as unknown as number,
        date: values.date as string,
        status: values.status as unknown as number,
      },
      {
        onSuccess: () => {
          form.reset({
            employeeId: 0,
            date: getTodayString(),
            status: AttendanceStatusEnum.Present,
          });
        },
        onError: (error) => {
          const parsed = parseApiError(error as unknown);
          toaster.create({
            title: "Error al registrar asistencia",
            description: parsed.message,
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Stack gap={6} p={4}>
      <HStack justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={3}>
        <Stack gap={1}>
          <Heading size="xl">Registro de Asistencia</Heading>
          <Text fontSize="sm" color="gray.500">
            {currentMonth}/{currentYear}
          </Text>
        </Stack>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dash")}>
          <LuArrowLeft /> Volver
        </Button>
      </HStack>

      <Card.Root variant="outline">
        <Card.Body>
          <Stack gap={5}>
            <Heading size="md">Registrar Asistencia</Heading>

            <Stack
              as="form"
              onSubmit={form.handleSubmit(handleRegister)}
              gap={5}
            >
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }}
                gap={4}
                alignItems="start"
              >
                <Field.Root
                  gridColumn={{ base: "1 / -1", md: "span 4" }}
                  invalid={!!form.formState.errors.employeeId}
                  required
                >
                  <Field.Label>Empleado</Field.Label>
                  <Controller
                    name="employeeId"
                    control={form.control}
                    render={({ field }) => (
                      <Select.Root
                        collection={employeeCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) =>
                          field.onChange(
                            event.value[0] ? Number(event.value[0]) : 0,
                          )
                        }
                        disabled={createAttendance.isPending}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Selecciona empleado" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content>
                              {employeeCollection.items.map((item) => (
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
                  <Field.ErrorText>
                    {form.formState.errors.employeeId?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root
                  gridColumn={{ base: "1 / -1", md: "span 3" }}
                  invalid={!!form.formState.errors.date}
                  required
                >
                  <Field.Label>Fecha</Field.Label>
                  <Controller
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid",
                          borderColor: form.formState.errors.date
                            ? "var(--chakra-colors-red-500)"
                            : "var(--chakra-colors-gray-200)",
                          borderRadius: "8px",
                          fontSize: "inherit",
                          background: "transparent",
                        }}
                        disabled={createAttendance.isPending}
                      />
                    )}
                  />
                  <Field.ErrorText>
                    {form.formState.errors.date?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root
                  gridColumn={{ base: "1 / -1", md: "span 3" }}
                  invalid={!!form.formState.errors.status}
                  required
                >
                  <Field.Label>Estado</Field.Label>
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Select.Root
                        collection={statusCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) =>
                          field.onChange(Number(event.value[0]))
                        }
                        disabled={createAttendance.isPending}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Selecciona estado" />
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
                  <Field.ErrorText>
                    {form.formState.errors.status?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root
                  gridColumn={{ base: "1 / -1", md: "span 2" }}
                  alignSelf="flex-end"
                >
                  <Field.Label>&nbsp;</Field.Label>
                  <Button
                    colorPalette="brand"
                    type="submit"
                    w="full"
                    disabled={createAttendance.isPending}
                  >
                    <LuSave /> Registrar
                  </Button>
                </Field.Root>
              </Grid>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Body>
          <Stack gap={4}>
            <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
              <Heading size="md">Asistencias del Mes</Heading>
              <Box minW="200px">
                <Select.Root
                  collection={employeeFilterCollection}
                  value={[String(selectedEmployeeFilter)]}
                  onValueChange={(event) =>
                    setSelectedEmployeeFilter(
                      event.value[0] ? Number(event.value[0]) : 0,
                    )
                  }
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Todos los empleados" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.ClearTrigger />
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {employeeFilterCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>
            </HStack>

            <Box borderWidth="1px" borderColor="gray.200" rounded="md" overflow="hidden">
              <Table.ScrollArea maxHeight="400px">
                <Table.Root size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row bg="bg.subtle">
                      <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                      <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                      <Table.ColumnHeader>Estado</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {attendanceListQuery.isPending ? (
                      <Table.Row>
                        <Table.Cell colSpan={3} textAlign="center" py={8}>
                          Cargando asistencias...
                        </Table.Cell>
                      </Table.Row>
                    ) : attendances.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={3} textAlign="center" py={8}>
                          No hay asistencias registradas para este mes.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      attendances.map((att) => (
                        <Table.Row key={att.id}>
                          <Table.Cell>{att.employeeFullName}</Table.Cell>
                          <Table.Cell>{att.date}</Table.Cell>
                          <Table.Cell>
                            <Text
                              colorPalette={
                                statusColorMap[att.status] ?? "gray"
                              }
                              fontWeight="medium"
                            >
                              {statusLabelMap[att.status] ?? att.statusName}
                            </Text>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Box>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
