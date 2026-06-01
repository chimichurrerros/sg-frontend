import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Box,
  Button,
  Card,
  createListCollection,
  Field,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Select,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuCalculator, LuCheck, LuFilter, LuPencil, LuPlus, LuRefreshCw, LuSearch, LuTrash2, LuX } from "react-icons/lu";
import { useQueryClient } from "@tanstack/react-query";
import { useAllEmployees } from "@/queries/employees.queries";
import { useGetPayrollUpdates } from "@/queries/payroll-updates.queries";
import {
  payrollProcessesApi,
  type PayrollManualDetailResponseDto,
  type PayrollProcessResponseDto,
} from "@/api/payroll-processes.api";
import {
  useCalculatePayrollProcess,
  useCloseAndPayPayrollProcess,
  useCreatePayrollProcess,
  useDeletePayrollProcess,
  useDeletePayrollProcessManualDetail,
  useGetPayrollProcessManualDetails,
  useGetPayrollProcesses,
  useUpdatePayrollProcess,
  useUpdatePayrollProcessStatus,
} from "@/queries/payroll-processes.queries";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { toaster } from "@/components/ui/toaster";
import { parseApiError } from "@/utils/api-error";

const payrollProcessSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido"),
  processTypeId: z.coerce.number().min(1, "Tipo requerido"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  payDate: z.string().optional().nullable(),
  payrollStatusId: z.coerce.number().min(1, "Estado requerido"),
});

const manualDetailSchema = z.object({
  employeeId: z.coerce.number().min(1, "Funcionario requerido"),
  payrollUpdateId: z.coerce.number().min(1, "Concepto requerido"),
  amount: z
    .string()
    .min(1, "Monto requerido")
    .refine((value) => Number.isFinite(Number(value)), "Monto inválido")
    .transform((value) => Number(value)),
});

type PayrollProcessForm = z.input<typeof payrollProcessSchema>;
type ManualDetailForm = z.input<typeof manualDetailSchema>;

const processTypeOptions = [
  { label: "MENSUAL", value: 1 },
  { label: "AGUINALDO", value: 2 },
];

const payrollStatusOptions = [
  { label: "ABIERTO", value: 1 },
  { label: "CERRADO", value: 2 },
  { label: "PAGADO", value: 3 },
];

const processTypeCollection = createListCollection({
  items: processTypeOptions.map((option) => ({
    label: option.label,
    value: String(option.value),
  })),
});

const payrollStatusCollection = createListCollection({
  items: payrollStatusOptions.map((option) => ({
    label: option.label,
    value: String(option.value),
  })),
});

const isOpenStatus = (process?: PayrollProcessResponseDto | null) => {
  const text = process?.payrollStatusName?.toLowerCase() ?? "";
  return text.includes("abierto") || process?.payrollStatusId === 1;
};

const isPayableStatus = (process?: PayrollProcessResponseDto | null) => {
  const text = process?.payrollStatusName?.toLowerCase() ?? "";
  return text.includes("procesado") && !text.includes("pagado");
};

const formatStatusColor = (statusName?: string | null) => {
  const text = (statusName ?? "").toLowerCase();
  if (text.includes("abierto")) return "green";
  if (text.includes("procesado")) return "blue";
  if (text.includes("cerrado")) return "orange";
  if (text.includes("pagado")) return "purple";
  return "gray";
};

export default function PlanillasPage() {
  const queryClient = useQueryClient();
  const employeesQuery = useAllEmployees();
  const payrollUpdatesQuery = useGetPayrollUpdates();
  const processesQuery = useGetPayrollProcesses();
  const createPayrollProcess = useCreatePayrollProcess();
  const updatePayrollProcess = useUpdatePayrollProcess();
  const deletePayrollProcess = useDeletePayrollProcess();

  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [planillaSearch, setPlanillaSearch] = useState("");
  const [statusDraft, setStatusDraft] = useState<string>("1");

  const selectedProcessQuery = useGetPayrollProcessManualDetails(selectedProcessId ?? undefined);
  const updateProcessStatus = useUpdatePayrollProcessStatus(selectedProcessId ?? undefined);
  const deleteManualDetail = useDeletePayrollProcessManualDetail(selectedProcessId ?? undefined);

  const payrollProcessForm = useForm<PayrollProcessForm>({
    resolver: zodResolver(payrollProcessSchema),
    defaultValues: {
      name: "",
      processTypeId: 1,
      startDate: new Date().toISOString().slice(0, 10),
      payDate: new Date().toISOString().slice(0, 10),
      payrollStatusId: 1,
    },
  });

  const manualDetailForm = useForm<ManualDetailForm>({
    resolver: zodResolver(manualDetailSchema) as never,
    defaultValues: {
      employeeId: 0 as never,
      payrollUpdateId: 0 as never,
      amount: "",
    },
  });

  const employees = useMemo(() => employeesQuery.data?.employees ?? [], [employeesQuery.data]);
  const payrollUpdates = useMemo(() => payrollUpdatesQuery.data ?? [], [payrollUpdatesQuery.data]);
  const processes = useMemo(() => processesQuery.data ?? [], [processesQuery.data]);
  const manualDetails = selectedProcessQuery.data ?? [];
  const selectedProcess = useMemo(
    () => processes.find((process) => process.id === selectedProcessId) ?? null,
    [processes, selectedProcessId],
  );

  const selectedProcessIsOpen = isOpenStatus(selectedProcess);
  const calculatePayrollProcess = useCalculatePayrollProcess(selectedProcess?.id);
  const closeAndPayPayrollProcess = useCloseAndPayPayrollProcess(selectedProcess?.id);

  const fixedConcepts = useMemo(
    () => payrollUpdates.filter((item) => item.formulaTypeId === 1),
    [payrollUpdates],
  );

  const fixedConceptsCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Selecciona un concepto fijo", value: "" },
          ...fixedConcepts.map((concept) => ({
            label: concept.name,
            value: String(concept.id),
          })),
        ],
      }),
    [fixedConcepts],
  );

  const filteredProcesses = useMemo(() => {
    const term = planillaSearch.trim().toLowerCase();
    if (!term) return processes;

    return processes.filter((process) => {
      return [
        process.name,
        process.processTypeName,
        process.payrollStatusName,
        String(process.year),
        String(process.month),
        parseDate(process.startDate),
        process.payDate ? parseDate(process.payDate) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [processes, planillaSearch]);

  const branchOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => String(employee.branchId ?? ""))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    [employees],
  );

  const areaOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.areaName ?? String(employee.areaId))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [employees],
  );

  const positionOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.positionName ?? "-")))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [employees],
  );

  const branchFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Sucursales", value: "" },
          ...branchOptions.map((option) => ({ label: `Sucursal #${option}`, value: option })),
        ],
      }),
    [branchOptions],
  );

  const areaFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Áreas", value: "" },
          ...areaOptions.map((option) => ({ label: option, value: option })),
        ],
      }),
    [areaOptions],
  );

  const positionFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todos los Cargos", value: "" },
          ...positionOptions.map((option) => ({ label: option, value: option })),
        ],
      }),
    [positionOptions],
  );

  const filteredEmployees = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !term ||
        [
          employee.legajo,
          employee.firstName,
          employee.lastName,
          employee.documentNumber,
          employee.areaName ?? String(employee.areaId),
          employee.positionName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesBranch = !branchFilter || String(employee.branchId ?? "") === branchFilter;
      const matchesArea = !areaFilter || (employee.areaName ?? String(employee.areaId)) === areaFilter;
      const matchesPosition = !positionFilter || (employee.positionName ?? "-") === positionFilter;

      return matchesSearch && matchesBranch && matchesArea && matchesPosition;
    });
  }, [employees, employeeSearch, branchFilter, areaFilter, positionFilter]);

  useEffect(() => {
    if (!selectedProcess) {
      payrollProcessForm.reset({
        name: "",
        processTypeId: 1,
        startDate: new Date().toISOString().slice(0, 10),
        payDate: new Date().toISOString().slice(0, 10),
        payrollStatusId: 1,
      });
      setStatusDraft("1");
      return;
    }

    payrollProcessForm.reset({
      name: selectedProcess.name,
      processTypeId: selectedProcess.processTypeId,
      startDate: selectedProcess.startDate.slice(0, 10),
      payDate: selectedProcess.payDate?.slice(0, 10) ?? "",
      payrollStatusId: selectedProcess.payrollStatusId,
    });
    setStatusDraft(String(selectedProcess.payrollStatusId));
  }, [selectedProcess, payrollProcessForm]);

  const handleSelectProcess = (process: PayrollProcessResponseDto) => {
    setSelectedProcessId(process.id);
    setSelectedEmployeeIds([]);
    manualDetailForm.reset({ employeeId: 0, payrollUpdateId: 0, amount: "" });
  };

  const handleNewPlanilla = () => {
    setSelectedProcessId(null);
    setSelectedEmployeeIds([]);
    manualDetailForm.reset({ employeeId: 0, payrollUpdateId: 0, amount: "" });
    payrollProcessForm.reset({
      name: "",
      processTypeId: 1,
      startDate: new Date().toISOString().slice(0, 10),
      payDate: new Date().toISOString().slice(0, 10),
      payrollStatusId: 1,
    });
  };

  const handleSavePlanilla = async (values: PayrollProcessForm) => {
    try {
      const date = new Date(values.startDate + "T12:00:00");
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const processTypeId = values.processTypeId as unknown as number;
      const payrollStatusId = values.payrollStatusId as unknown as number;
      const name = values.name as string;
      const startDate = values.startDate as string;

      if (selectedProcess) {
        await updatePayrollProcess.mutateAsync({
          id: selectedProcess.id,
          body: {
            name,
            processTypeId,
            year,
            month,
            startDate,
            payDate: values.payDate ?? null,
            payrollStatusId,
          },
        });
        return;
      }

      const created = await createPayrollProcess.mutateAsync({
        name,
        processTypeId,
        year,
        month,
        startDate,
        payDate: values.payDate ?? null,
        payrollStatusId,
      });

      setSelectedProcessId(created.id);
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({
        title: selectedProcess ? "No se pudo actualizar la planilla" : "No se pudo crear la planilla",
        description: parsed.message,
        type: "error",
      });
    }
  };

  const handleDeletePlanilla = async () => {
    if (!selectedProcess) return;

    try {
      await deletePayrollProcess.mutateAsync(selectedProcess.id);
      handleNewPlanilla();
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo eliminar la planilla", description: parsed.message, type: "error" });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedProcess) return;

    try {
      await updateProcessStatus.mutateAsync({ payrollStatusId: Number(statusDraft) });
      await processesQuery.refetch();
      await selectedProcessQuery.refetch();
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo cambiar el estado", description: parsed.message, type: "error" });
    }
  };

  const handleAddManualDetails = async () => {
    if (!selectedProcess || !selectedEmployeeIds.length) {
      toaster.create({ title: "Selecciona funcionarios", type: "warning" });
      return;
    }

    const values = manualDetailForm.getValues();
    const payrollUpdateId = values.payrollUpdateId as unknown as number;
    const amount = values.amount as unknown as number;
    if (!payrollUpdateId || !amount) {
      manualDetailForm.trigger();
      return;
    }

    try {
      await Promise.all(
        selectedEmployeeIds.map((employeeId) =>
          payrollProcessesApi.upsertManualDetail(selectedProcess.id, {
            employeeId,
            payrollUpdateId,
            amount: amount,
          }),
        ),
      );
      setSelectedEmployeeIds([]);
      manualDetailForm.reset({ employeeId: 0, payrollUpdateId: 0, amount: "" });
      await selectedProcessQuery.refetch();
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudieron agregar los conceptos", description: parsed.message, type: "error" });
    }
  };

  const handleDeleteManualDetail = async (detailId: number) => {
    try {
      await deleteManualDetail.mutateAsync(detailId);
      await selectedProcessQuery.refetch();
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo eliminar el detalle", description: parsed.message, type: "error" });
    }
  };

  const handleCalculate = async () => {
    if (!selectedProcess) return;

    try {
      await calculatePayrollProcess.mutateAsync();
      await selectedProcessQuery.refetch();
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo calcular la planilla", description: parsed.message, type: "error" });
    }
  };

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId)
        ? current.filter((item) => item !== employeeId)
        : [...current, employeeId],
    );
  };

  return (
    <Stack gap={5} p={4}>
      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">{selectedProcess ? "Editar Planilla" : "Nueva Planilla"}</Heading>
        </Card.Header>
        <Card.Body>
          <Stack as="form" gap={4} onSubmit={payrollProcessForm.handleSubmit(handleSavePlanilla)}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!payrollProcessForm.formState.errors.name} required>
                <Field.Label>Nombre</Field.Label>
                <Controller
                  name="name"
                  control={payrollProcessForm.control}
                  render={({ field }) => <Input placeholder="PLANILLA - FEBRERO 2026" {...field} />}
                />
                <Field.ErrorText>{payrollProcessForm.formState.errors.name?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!payrollProcessForm.formState.errors.processTypeId} required>
                <Field.Label>Tipo</Field.Label>
                <Controller
                  name="processTypeId"
                  control={payrollProcessForm.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={processTypeCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(Number(event.value[0]))}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Seleccionar tipo" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {processTypeCollection.items.map((item) => (
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
                <Field.ErrorText>{payrollProcessForm.formState.errors.processTypeId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!payrollProcessForm.formState.errors.startDate} required>
                <Field.Label>Fecha de Alta</Field.Label>
                <Controller
                  name="startDate"
                  control={payrollProcessForm.control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                <Field.ErrorText>{payrollProcessForm.formState.errors.startDate?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!payrollProcessForm.formState.errors.payDate}>
                <Field.Label>Fecha de Pago</Field.Label>
                <Controller
                  name="payDate"
                  control={payrollProcessForm.control}
                  render={({ field }) => <Input type="date" {...field} value={field.value ?? ""} />}
                />
                <Field.ErrorText>{payrollProcessForm.formState.errors.payDate?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!payrollProcessForm.formState.errors.payrollStatusId} required>
                <Field.Label>Estado</Field.Label>
                <Controller
                  name="payrollStatusId"
                  control={payrollProcessForm.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={payrollStatusCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(Number(event.value[0]))}
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
                            {payrollStatusCollection.items.map((item) => (
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
                <Field.ErrorText>{payrollProcessForm.formState.errors.payrollStatusId?.message}</Field.ErrorText>
              </Field.Root>
            </Grid>

            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Button variant="outline" onClick={handleNewPlanilla}>
                Cancelar
              </Button>
              <Button type="submit" colorPalette="brand" loading={createPayrollProcess.isPending || updatePayrollProcess.isPending}>
                  Crear
                </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Body>
          <Stack gap={3}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", md: "22rem" }}>
                <Input placeholder="Buscar planillas" value={planillaSearch} onChange={(event) => setPlanillaSearch(event.target.value)} />
              </InputGroup>
              <HStack>
                <IconButton variant="outline" disabled={!selectedProcess} onClick={handleDeletePlanilla}><LuTrash2 size={18} />Eliminar</IconButton>
                <IconButton variant="outline" colorPalette="brand" disabled={!selectedProcess}><LuPencil size={18} />Editar</IconButton>
              </HStack>
            </HStack>

            <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="280px">
              <Table.Root size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Nombre de Planilla</Table.ColumnHeader>
                    <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Alta</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Pago</Table.ColumnHeader>
                    <Table.ColumnHeader>Estado</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredProcesses.map((process) => (
                    <Table.Row
                      key={process.id}
                      bg={process.id === selectedProcessId ? "green.subtle" : "transparent"}
                      _hover={{ bg: process.id === selectedProcessId ? "green.subtle" : "gray.100" }}
                      cursor="pointer"
                      onClick={() => handleSelectProcess(process)}
                    >
                      <Table.Cell>{process.name}</Table.Cell>
                      <Table.Cell>{process.processTypeName}</Table.Cell>
                      <Table.Cell>{parseDate(process.startDate)}</Table.Cell>
                      <Table.Cell>{process.payDate ? parseDate(process.payDate) : "-"}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={formatStatusColor(process.payrollStatusName)}>{process.payrollStatusName}</Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filteredProcesses.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5} textAlign="center" py={8}>
                        Sin resultados de planillas
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Stack>
        </Card.Body>
      </Card.Root>

      {selectedProcess && (
        <Card.Root variant="outline">
          <Card.Header>
            <Heading size="md">Tabla de Asalariados - {selectedProcess.name}</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={4}>
              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <HStack>
                  <Text fontWeight="semibold">Estado:</Text>
                  <Badge colorPalette={formatStatusColor(selectedProcess.payrollStatusName)}>{selectedProcess.payrollStatusName}</Badge>
                </HStack>
                <HStack>
                  <Input
                    size="sm"
                    maxW="140px"
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    placeholder="StatusId"
                  />
                  <Button size="sm" variant="outline" onClick={handleUpdateStatus} loading={updateProcessStatus.isPending}>
                    Actualizar estado
                  </Button>
                </HStack>
              </HStack>

              <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={3}>
                  <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }}>
                  <Field.Label>Concepto</Field.Label>
                  <Controller
                    name="payrollUpdateId"
                    control={manualDetailForm.control}
                    render={({ field }) => (
                      <Select.Root
                        collection={fixedConceptsCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(event.value[0] ? Number(event.value[0]) : 0)}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Selecciona un concepto fijo" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content>
                              {fixedConceptsCollection.items.map((item) => (
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

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }}>
                  <Field.Label>Monto</Field.Label>
                  <Controller
                    name="amount"
                    control={manualDetailForm.control}
                    render={({ field }) => <Input type="number" min={0} step="0.01" placeholder="Ej: 150000" {...field} />}
                  />
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }}>
                  <Field.Label>Acción</Field.Label>
                  <Button w="full" colorPalette="green" onClick={handleAddManualDetails} loading={selectedProcessQuery.isFetching}>
                    Añadir
                  </Button>
                </Field.Root>
              </Grid>

              <HStack flexWrap="wrap" gap={2}>
                <Box position="relative">
                  <Box position="absolute" left="10px" top="9px" color="fg.muted">
                    <LuSearch size={14} />
                  </Box>
                  <Input
                    maxW="360px"
                    pl="34px"
                    placeholder="Buscar por nombre, legajo..."
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                  />
                </Box>

                <Box minW="180px">
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
                </Box>

                <Box minW="180px">
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
                </Box>

                <Box minW="180px">
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
                </Box>
              </HStack>

              <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="260px">
                <Table.Root size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader w="50px">Sel.</Table.ColumnHeader>
                      <Table.ColumnHeader>Legajo</Table.ColumnHeader>
                      <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                      <Table.ColumnHeader>Sucursal</Table.ColumnHeader>
                      <Table.ColumnHeader>Área</Table.ColumnHeader>
                      <Table.ColumnHeader>Cargo</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredEmployees.map((employee) => (
                      <Table.Row key={employee.id}>
                        <Table.Cell>
                          <input
                            type="checkbox"
                            checked={selectedEmployeeIds.includes(employee.id)}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                          />
                        </Table.Cell>
                        <Table.Cell>{employee.legajo}</Table.Cell>
                        <Table.Cell>
                          {employee.firstName} {employee.lastName}
                        </Table.Cell>
                        <Table.Cell>{employee.branchId ? `#${employee.branchId}` : "-"}</Table.Cell>
                        <Table.Cell>{employee.areaName ?? employee.areaId}</Table.Cell>
                        <Table.Cell>{employee.positionName ?? "-"}</Table.Cell>
                      </Table.Row>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan={6} textAlign="center" py={8}>
                          Sin funcionarios para mostrar
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>

              <HStack justify="space-between">
                <Button variant="outline" onClick={() => setSelectedEmployeeIds([])}>
                  Cancelar
                </Button>
                <Button colorPalette="green" onClick={handleAddManualDetails} disabled={!selectedEmployeeIds.length}>
                  Añadir
                </Button>
              </HStack>

              <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="320px">
                <Table.Root size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Legajo</Table.ColumnHeader>
                      <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                      <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                      <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                      <Table.ColumnHeader>Monto</Table.ColumnHeader>
                      <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {manualDetails.map((detail: PayrollManualDetailResponseDto) => (
                      <Table.Row key={detail.id}>
                        <Table.Cell>{detail.employeeId}</Table.Cell>
                        <Table.Cell>{detail.employeeFullName}</Table.Cell>
                        <Table.Cell>{detail.conceptName}</Table.Cell>
                        <Table.Cell>{detail.payrollTypeName}</Table.Cell>
                        <Table.Cell>{parsePrice(detail.amount)}</Table.Cell>
                        <Table.Cell>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            aria-label="Eliminar detalle"
                            onClick={() => handleDeleteManualDetail(detail.id)}
                          >
                            <LuTrash2 />
                          </IconButton>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {manualDetails.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan={6} textAlign="center" py={8}>
                          Todavía no agregaste conceptos a esta planilla
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>

              <HStack justify="flex-end" gap={3}>
                <Button colorPalette="brand" onClick={handleCalculate} loading={calculatePayrollProcess.isPending} disabled={!selectedProcessIsOpen}>
                  <LuCalculator /> Calcular planilla
                </Button>
                <Button
                  colorPalette="green"
                  onClick={() => closeAndPayPayrollProcess.mutate()}
                  loading={closeAndPayPayrollProcess.isPending}
                  disabled={!selectedProcess || !isPayableStatus(selectedProcess)}
                >
                  <LuCheck /> Confirmar Pago
                </Button>
              </HStack>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Stack>
  );
}
