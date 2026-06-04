import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, createListCollection, Field, Grid, Heading, HStack, Input, Portal, Select, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuPlus, LuTrash2 } from "react-icons/lu";
import { Pencil } from "lucide-react";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import { useGetPositions } from "@/queries/positions.queries";
import { useGetSchedules } from "@/queries/schedules.queries";
import { useCreateEmployeeHistory, useDeleteEmployeeHistory, useGetEmployee, useGetEmployeeHistory, useUpdateEmployeeHistory } from "@/queries/employees.queries";
import { parseApiError } from "@/utils/api-error";
import { parsePrice } from "@/constants/price";
import { parseDate } from "@/constants/date";
import type { UpdateEmployeePositionHistoryRequestDto } from "@/api/employees.api";
import type { PositionResponseDto, ScheduleResponseDto } from "@/types/organization";

const historySchema = z.object({
  positionId: z.coerce.number().min(1, "El cargo es requerido"),
  scheduleId: z.coerce.number().min(1, "El horario es requerido"),
  basicSalary: z.coerce.number().positive("El salario debe ser mayor a 0"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional().nullable(),
});

type HistoryFormInput = z.input<typeof historySchema>;
type HistoryFormOutput = z.output<typeof historySchema>;

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
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const getFullName = (employee?: { name?: string | null; lastname?: string | null } | null) =>
  `${employee?.name ?? ""} ${employee?.lastname ?? ""}`.trim();

export default function EmployeeHistoryPage({ basePath = "/rrhh/empleados" }: { basePath?: string }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const employeeId = id ? Number(id) : undefined;

  const { data: employeeData } = useGetEmployee(employeeId);
  const { data: positionsData } = useGetPositions({ page: 1, pageSize: 100, sortBy: "name", sortOrder: "asc" });
  const { data: schedulesData } = useGetSchedules({ page: 1, pageSize: 100, sortBy: "name", sortOrder: "asc" });
  const historyQuery = useGetEmployeeHistory(employeeId);
  const createHistory = useCreateEmployeeHistory(employeeId ?? 0);
  const updateHistory = useUpdateEmployeeHistory(employeeId ?? 0);
  const deleteHistory = useDeleteEmployeeHistory(employeeId ?? 0);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

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
          label: schedule.name
            ? `${schedule.name} (${schedule.arrivalTime.slice(0, 5)} - ${schedule.departureTime.slice(0, 5)})`
            : `Horario #${schedule.id}`,
          value: String(schedule.id),
        })),
      }),
    [schedulesData],
  );

  const form = useForm<HistoryFormInput, any, HistoryFormOutput>({
    resolver: zodResolver(historySchema),
    defaultValues: {
      positionId: 0,
      scheduleId: 0,
      basicSalary: 0,
      startDate: toDateInputToday(),
      endDate: "",
    },
  });

  const employee = employeeData?.employee ?? null;
  const histories = historyQuery.data?.histories ?? [];
  const isPending = createHistory.isPending || updateHistory.isPending || deleteHistory.isPending;

  const currentPositionLabel = useMemo(() => {
    const currentPosition = positionsData?.positions?.find((position) => position.id === employee?.positionId);
    return currentPosition?.name ?? employee?.positionName ?? "-";
  }, [employee?.positionId, employee?.positionName, positionsData]);

  const onSubmit = async (formData: HistoryFormOutput) => {
    if (!employeeId) return;

    const payload = {
      positionId: formData.positionId,
      scheduleId: formData.scheduleId,
      basicSalary: formData.basicSalary,
      startDate: formData.startDate,
      endDate: formData.endDate ?? null,
    };

    try {
      if (editingHistoryId) {
        await updateHistory.mutateAsync({ historyId: editingHistoryId, data: payload as UpdateEmployeePositionHistoryRequestDto });
        toaster.create({ title: "Cargo actualizado con éxito", type: "success" });
      } else {
        await createHistory.mutateAsync({
          positionId: formData.positionId,
          scheduleId: formData.scheduleId,
          basicSalary: formData.basicSalary,
          startDate: formData.startDate,
        });
        toaster.create({ title: "Nuevo cargo agregado con éxito", type: "success" });
      }
      setEditingHistoryId(null);
      setSelectedHistoryId(null);
      setShowForm(false);
      form.reset({
        positionId: employee?.positionId ?? 0,
        scheduleId: employee?.scheduleId ?? 0,
        basicSalary: employee?.baseSalary ?? 0,
        startDate: toDateInputToday(),
        endDate: "",
      });
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo guardar el cargo", description: parsed.message, type: "error" });
    }
  };

  const formDisabled = !employeeId;

  return (
    <Stack gap={6} p={4} maxW="1200px">
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Heading size="xl">Cargos — {getFullName(employee)}</Heading>
        <Button variant="outline" onClick={() => navigate(`${basePath}/${employeeId}`)}>
          <LuArrowLeft />
          Volver al perfil
        </Button>
      </HStack>

      <Card.Root variant="outline">
        <Card.Body>
          <Box borderWidth="1px" rounded="md" p={4} bg="bg.subtle">
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
              <Text><Text as="span" fontWeight="semibold">Legajo:</Text> {employee?.fileNumber ?? "-"}</Text>
              <Text><Text as="span" fontWeight="semibold">Cargo actual:</Text> {currentPositionLabel}</Text>
              <Text><Text as="span" fontWeight="semibold">Sucursal:</Text> {employee?.branchName ?? "-"}</Text>
              <Text><Text as="span" fontWeight="semibold">Salario base:</Text> {parsePrice(employee?.baseSalary ?? 0)}</Text>
            </Grid>
          </Box>
        </Card.Body>
      </Card.Root>

      {showForm && (
      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">{editingHistoryId ? "Editar Cambio de Cargo / Salario" : "Nuevo Cambio de Cargo / Salario"}</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={4} as="form" onSubmit={form.handleSubmit(onSubmit)}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.positionId}>
                <Field.Label>Cargo</Field.Label>
                <Controller
                  name="positionId"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={positionCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(Number(event.value[0]))}
                      disabled={formDisabled || isPending}
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
                <Field.ErrorText>{form.formState.errors.positionId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.scheduleId}>
                <Field.Label>Horario</Field.Label>
                <Controller
                  name="scheduleId"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={scheduleCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(Number(event.value[0]))}
                      disabled={formDisabled || isPending}
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
                <Field.ErrorText>{form.formState.errors.scheduleId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.basicSalary}>
                <Field.Label>Salario Base</Field.Label>
                <Input type="number" min={1} step="1" {...form.register("basicSalary", { valueAsNumber: true })} disabled={formDisabled || isPending} />
                <Field.ErrorText>{form.formState.errors.basicSalary?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.startDate}>
                <Field.Label>Fecha de Inicio</Field.Label>
                <Input type="date" {...form.register("startDate")} disabled={formDisabled || isPending} />
                <Field.ErrorText>{form.formState.errors.startDate?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.endDate}>
                <Field.Label>Fecha de Finalización</Field.Label>
                <Input type="date" {...form.register("endDate")} disabled={formDisabled || isPending} />
                <Field.ErrorText>{form.formState.errors.endDate?.message}</Field.ErrorText>
              </Field.Root>
            </Grid>

            <HStack justify="space-between">
              <Button variant="outline" onClick={() => {
                setEditingHistoryId(null);
                form.reset({
                  positionId: employee?.positionId ?? 0,
                  scheduleId: employee?.scheduleId ?? 0,
                  basicSalary: employee?.baseSalary ?? 0,
                  startDate: toDateInputToday(),
                  endDate: "",
                });
                setShowForm(false);
              }} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" colorPalette="brand" loading={isPending} disabled={formDisabled}>
                {editingHistoryId ? "Actualizar" : "Guardar"}
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>
      )}

      <Card.Root variant="outline">
        <Card.Header>
          <HStack justify="space-between">
            <Heading size="md">Historial de Cargos</Heading>
            <HStack gap={2}>
              <Button
                variant="outline"
                colorPalette="brand"
                disabled={!selectedHistoryId || isPending}
                onClick={() => {
                  const history = histories.find((h) => h.id === selectedHistoryId);
                  if (!history) return;
                  setEditingHistoryId(history.id);
                  form.reset({
                    positionId: history.positionId,
                    scheduleId: history.scheduleId,
                    basicSalary: history.basicSalary,
                    startDate: toDateInput(history.startDate),
                    endDate: history.endDate ? toDateInput(history.endDate) : toDateInputToday(),
                  });
                  setShowForm(true);
                }}
              >
                <Pencil size={18} />
                Editar
              </Button>
              <DestructiveActionDialog
                title="Eliminar cambio de cargo"
                description="Esta acción no se puede deshacer."
                acceptText="Eliminar"
                onAccept={async () => {
                  if (!selectedHistoryId) return;
                  await deleteHistory.mutateAsync(selectedHistoryId);
                  toaster.create({ title: "Cambio de cargo eliminado", type: "success" });
                  setSelectedHistoryId(null);
                  setEditingHistoryId(null);
                }}
                trigger={
                  <Button variant="outline" colorPalette="brand" disabled={!selectedHistoryId || isPending}>
                    {deleteHistory.isPending ? <Spinner size="sm" /> : <LuTrash2 size={18} />}
                    Eliminar
                  </Button>
                }
              />
              <Button
                colorPalette="brand"
                disabled={isPending}
                onClick={() => {
                  setEditingHistoryId(null);
                  setSelectedHistoryId(null);
                  form.reset({
                    positionId: employee?.positionId ?? 0,
                    scheduleId: employee?.scheduleId ?? 0,
                    basicSalary: employee?.baseSalary ?? 0,
                    startDate: toDateInputToday(),
                    endDate: "",
                  });
                  setShowForm(true);
                }}
              >
                <LuPlus size={18} />
                Nuevo cambio
              </Button>
            </HStack>
          </HStack>
        </Card.Header>
        <Card.Body>
          {historyQuery.isLoading ? (
            <Text>Cargando historial...</Text>
          ) : histories.length === 0 ? (
            <Text color="fg.muted">Todavía no hay cambios de cargo registrados.</Text>
          ) : (
            <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="320px">
              <Table.Root size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Cargo</Table.ColumnHeader>
                    <Table.ColumnHeader>Horario</Table.ColumnHeader>
                    <Table.ColumnHeader>Salario Base</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Inicio</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Finalización</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {histories.map((history) => (
                    <Table.Row
                      key={history.id}
                      onClick={() => setSelectedHistoryId(selectedHistoryId === history.id ? null : history.id)}
                      bg={selectedHistoryId === history.id ? "green.subtle" : "transparent"}
                      _hover={{ bg: selectedHistoryId === history.id ? "green.subtle" : "gray.100" }}
                      cursor="pointer"
                    >
                      <Table.Cell>{history.positionName ?? `Cargo #${history.positionId}`}</Table.Cell>
                      <Table.Cell>{history.scheduleName ?? `Horario #${history.scheduleId}`}</Table.Cell>
                      <Table.Cell>{parsePrice(history.basicSalary)}</Table.Cell>
                      <Table.Cell>{parseDate(history.startDate)}</Table.Cell>
                      <Table.Cell>{history.endDate ? parseDate(history.endDate) : "-"}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
