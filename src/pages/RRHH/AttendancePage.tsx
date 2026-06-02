import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Box,
  Button,
  Card,
  Collapsible,
  createListCollection,
  Field,
  Grid,
  Heading,
  HStack,
  Input,
  InputGroup,
  Portal,
  Select,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuChevronLeft, LuChevronRight, LuFilter, LuSave, LuSearch } from "react-icons/lu";
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

function getFirstDayOfMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function getLastDayOfMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const navigate = useNavigate();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<number>(0);
  const [branchFilter, setBranchFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [fromDate, setFromDate] = useState(getFirstDayOfMonth(currentYear, currentMonth));
  const [toDate, setToDate] = useState(getLastDayOfMonth(currentYear, currentMonth));
  const [showFilters, setShowFilters] = useState(false);

  const employeesQuery = useAllEmployees();
  const createAttendance = useCreateAttendance();

  const attendanceListQuery = useGetAttendanceList(
    selectedEmployeeFilter || undefined,
    fromDate,
    toDate,
  );

  const employees = useMemo(
    () => employeesQuery.data?.employees ?? [],
    [employeesQuery.data],
  );

  const attendances = useMemo(
    () => attendanceListQuery.data ?? [],
    [attendanceListQuery.data],
  );

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees],
  );

  const branchOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((e) => String(e.branchId ?? ""))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    [employees],
  );

  const areaOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((e) => e.areaName ?? String(e.areaId))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [employees],
  );

  const positionOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((e) => e.positionName ?? "-")))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [employees],
  );

  const branchFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Sucursales", value: "" },
          ...branchOptions.map((o) => ({ label: `Sucursal #${o}`, value: o })),
        ],
      }),
    [branchOptions],
  );

  const areaFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Áreas", value: "" },
          ...areaOptions.map((o) => ({ label: o, value: o })),
        ],
      }),
    [areaOptions],
  );

  const positionFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todos los Cargos", value: "" },
          ...positionOptions.map((o) => ({ label: o, value: o })),
        ],
      }),
    [positionOptions],
  );

  const filteredAttendances = useMemo(() => {
    const term = attendanceSearch.trim().toLowerCase();
    return attendances.filter((att) => {
      const emp = employeeMap.get(att.employeeId);
      const matchesSearch =
        !term ||
        (emp?.firstName ?? "").toLowerCase().includes(term) ||
        (emp?.lastName ?? "").toLowerCase().includes(term) ||
        (emp?.legajo ?? "").toLowerCase().includes(term);
      const matchesBranch = !branchFilter || String(emp?.branchId ?? "") === branchFilter;
      const matchesArea = !areaFilter || (emp?.areaName ?? String(emp?.areaId ?? "")) === areaFilter;
      const matchesPosition = !positionFilter || (emp?.positionName ?? "-") === positionFilter;
      return matchesSearch && matchesBranch && matchesArea && matchesPosition;
    });
  }, [attendances, employeeMap, attendanceSearch, branchFilter, areaFilter, positionFilter]);

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

  const shiftMonth = useCallback((delta: number) => {
    setFromDate((prev) => {
      const d = new Date(prev + "T12:00:00");
      d.setMonth(d.getMonth() + delta);
      return getFirstDayOfMonth(d.getFullYear(), d.getMonth() + 1);
    });
    setToDate((prev) => {
      const d = new Date(prev + "T12:00:00");
      d.setMonth(d.getMonth() + delta);
      return getLastDayOfMonth(d.getFullYear(), d.getMonth() + 1);
    });
  }, []);

  const setDateRange = useCallback((from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  }, []);

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
          toaster.create({ title: "Asistencia registrada con éxito", type: "success" });
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
        <Heading size="xl">Registro de Asistencia</Heading>
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
            <Stack gap={3}>
              <Heading size="md">Filtrar Asistencias</Heading>

              <HStack gap={2} alignItems="end" flexWrap="wrap">
                <Box>
                  <Text fontSize="sm" mb={1}>Desde</Text>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{
                      width: "150px",
                      padding: "6px 10px",
                      border: "1px solid var(--chakra-colors-gray-200)",
                      borderRadius: "8px",
                      fontSize: "inherit",
                      background: "transparent",
                    }}
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" mb={1}>Hasta</Text>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                      width: "150px",
                      padding: "6px 10px",
                      border: "1px solid var(--chakra-colors-gray-200)",
                      borderRadius: "8px",
                      fontSize: "inherit",
                      background: "transparent",
                    }}
                  />
                </Box>
                <Button size="sm" variant="outline" onClick={() => shiftMonth(-1)}>
                  <LuChevronLeft />
                </Button>
                <Button size="sm" variant="outline" onClick={() => shiftMonth(1)}>
                  <LuChevronRight />
                </Button>
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
                <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", md: "18rem" }}>
                  <Input placeholder="Buscar por nombre..." value={attendanceSearch} onChange={(e) => setAttendanceSearch(e.target.value)} />
                </InputGroup>
                <Button variant="outline" colorPalette="brand" onClick={() => setShowFilters((c) => !c)}>
                  <LuFilter size={16} />
                  Filtros
                </Button>
              </HStack>

              <HStack flexWrap="wrap" gap={2}>
                <Button size="xs" variant="subtle" onClick={() => {
                  const n = new Date();
                  setDateRange(
                    getFirstDayOfMonth(n.getFullYear(), n.getMonth() + 1),
                    getLastDayOfMonth(n.getFullYear(), n.getMonth() + 1),
                  );
                }}>
                  Este mes
                </Button>
                <Button size="xs" variant="subtle" onClick={() => {
                  const n = new Date();
                  n.setMonth(n.getMonth() - 1);
                  setDateRange(
                    getFirstDayOfMonth(n.getFullYear(), n.getMonth() + 1),
                    getLastDayOfMonth(n.getFullYear(), n.getMonth() + 1),
                  );
                }}>
                  Mes pasado
                </Button>
                <Button size="xs" variant="subtle" onClick={() => {
                  const y = new Date().getFullYear();
                  setDateRange(`${y}-01-01`, `${y}-12-31`);
                }}>
                  Este año
                </Button>
              </HStack>

              <Collapsible.Root open={showFilters}>
                <Collapsible.Content>
                  <Box borderWidth="1px" rounded="md" p={4} bg="bg.subtle">
                    <Stack gap={4}>
                      <Text fontWeight="semibold">Filtros avanzados</Text>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                        <Field.Root>
                          <Field.Label>Sucursal</Field.Label>
                          <Select.Root
                            collection={branchFilterCollection}
                            value={[branchFilter]}
                            onValueChange={(event) => setBranchFilter(event.value[0] ?? "")}
                          >
                            <Select.HiddenSelect />
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Todas las Sucursales" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                <Select.ClearTrigger />
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                              <Select.Positioner>
                                <Select.Content>
                                  {branchFilterCollection.items.map((item) => (
                                    <Select.Item item={item} key={item.value}>
                                      {item.label}
                                      <Select.ItemIndicator />
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Positioner>
                            </Portal>
                          </Select.Root>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Área</Field.Label>
                          <Select.Root
                            collection={areaFilterCollection}
                            value={[areaFilter]}
                            onValueChange={(event) => setAreaFilter(event.value[0] ?? "")}
                          >
                            <Select.HiddenSelect />
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Todas las Áreas" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                <Select.ClearTrigger />
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                              <Select.Positioner>
                                <Select.Content>
                                  {areaFilterCollection.items.map((item) => (
                                    <Select.Item item={item} key={item.value}>
                                      {item.label}
                                      <Select.ItemIndicator />
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Positioner>
                            </Portal>
                          </Select.Root>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Cargo</Field.Label>
                          <Select.Root
                            collection={positionFilterCollection}
                            value={[positionFilter]}
                            onValueChange={(event) => setPositionFilter(event.value[0] ?? "")}
                          >
                            <Select.HiddenSelect />
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Todos los Cargos" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                <Select.ClearTrigger />
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                              <Select.Positioner>
                                <Select.Content>
                                  {positionFilterCollection.items.map((item) => (
                                    <Select.Item item={item} key={item.value}>
                                      {item.label}
                                      <Select.ItemIndicator />
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Positioner>
                            </Portal>
                          </Select.Root>
                        </Field.Root>
                      </Grid>
                    </Stack>
                  </Box>
                </Collapsible.Content>
              </Collapsible.Root>
            </Stack>

            <Box borderWidth="1px" borderColor="gray.200" rounded="md" overflow="hidden">
              <Table.ScrollArea maxHeight="400px">
                <Table.Root size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row bg="bg.subtle">
                      <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                      <Table.ColumnHeader>Sucursal</Table.ColumnHeader>
                      <Table.ColumnHeader>Área</Table.ColumnHeader>
                      <Table.ColumnHeader>Cargo</Table.ColumnHeader>
                      <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                      <Table.ColumnHeader>Estado</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {attendanceListQuery.isPending ? (
                      <Table.Row>
                        <Table.Cell colSpan={6} textAlign="center" py={8}>
                          Cargando asistencias...
                        </Table.Cell>
                      </Table.Row>
                    ) : attendanceListQuery.isError ? (
                      <Table.Row>
                        <Table.Cell colSpan={6} textAlign="center" py={8}>
                          Error al cargar las asistencias.
                        </Table.Cell>
                      </Table.Row>
                    ) : filteredAttendances.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={6} textAlign="center" py={8}>
                          No hay asistencias en el período seleccionado.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      filteredAttendances.map((att) => {
                        const emp = employeeMap.get(att.employeeId);
                        return (
                          <Table.Row key={att.id}>
                            <Table.Cell>{att.employeeFullName}</Table.Cell>
                            <Table.Cell>{emp?.branchId ? `#${emp.branchId}` : "-"}</Table.Cell>
                            <Table.Cell>{emp?.areaName ?? "-"}</Table.Cell>
                            <Table.Cell>{emp?.positionName ?? "-"}</Table.Cell>
                            <Table.Cell>{att.date}</Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette={statusColorMap[att.status] ?? "gray"}>
                                {statusLabelMap[att.status] ?? att.statusName}
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })
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
