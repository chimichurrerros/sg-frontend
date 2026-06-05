import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, createListCollection, Field, Grid, Heading, HStack, IconButton, Input, InputGroup, Portal, Select, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { Pencil, Trash2 } from "lucide-react";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { useAllEmployees } from "@/queries/employees.queries";
import { useGetPayrollUpdates } from "@/queries/payroll-updates.queries";
import { useCreateManualConcept, useDeleteManualConcept, useGetPendingManualConcepts, useUpdateManualConcept } from "@/queries/manual-concepts.queries";
import { parseApiError } from "@/utils/api-error";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import type { ManualConceptIncidentResponseDto } from "@/api/manual-concepts.api";

const manualSchema = z.object({
  employeeId: z.coerce.number().min(1, "Empleado requerido"),
  payrollUpdateId: z.coerce.number().min(1, "Concepto requerido"),
  amount: z.string().min(1, "Monto requerido"),
  occurrenceDate: z.string().min(1, "Fecha requerida"),
});

type FormInput = z.input<typeof manualSchema>;

const manualConceptStatusLabels: Record<string, string> = {
  Pending: "Pendiente",
  Assigned: "Asignado",
};

export default function ConceptosManualesPage() {
  const { data: employeesData } = useAllEmployees();
  const { data: payrollUpdatesData } = useGetPayrollUpdates();
  const pendingQuery = useGetPendingManualConcepts();
  const createManual = useCreateManualConcept();
  const updateManual = useUpdateManualConcept();
  const deleteManual = useDeleteManualConcept();
  const [editingItem, setEditingItem] = useState<ManualConceptIncidentResponseDto | null>(null);
  const [selected, setSelected] = useState<ManualConceptIncidentResponseDto | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => (pendingQuery.data ?? []).filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [item.employeeFullName, item.conceptName, item.occurrenceDate, String(item.amount)].some((v) => v?.toLowerCase().includes(q));
    }),
    [pendingQuery.data, search],
  );

  const employees = employeesData?.employees ?? [];
  const fixedConcepts = useMemo(() => (payrollUpdatesData ?? []).filter((u) => u.formulaTypeId === 1), [payrollUpdatesData]);

  const employeeCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Selecciona empleado", value: "" },
          ...employees.map((e) => ({ label: `${e.firstName} ${e.lastName}`.trim(), value: String(e.id) })),
        ],
      }),
    [employees],
  );

  const fixedConceptCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Selecciona concepto", value: "" },
          ...fixedConcepts.map((c) => ({ label: c.name, value: String(c.id) })),
        ],
      }),
    [fixedConcepts],
  );

  const form = useForm<FormInput>({ resolver: zodResolver(manualSchema), defaultValues: { employeeId: 0, payrollUpdateId: 0, amount: "", occurrenceDate: "" } });

  const isEditing = Boolean(editingItem);
  const isPending = createManual.isPending || updateManual.isPending || deleteManual.isPending;

  const onEdit = () => {
    if (!selected) return;
    setEditingItem(selected);
    form.reset({
      employeeId: selected.employeeId,
      payrollUpdateId: selected.payrollUpdateId,
      amount: String(selected.amount),
      occurrenceDate: selected.occurrenceDate,
    });
  };

  const onDelete = async () => {
    if (!selected) return;
    deleteManual.mutate(selected.id);
    setSelected(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const onSubmit = (values: FormInput) => {
    const payload = {
      employeeId: values.employeeId as unknown as number,
      payrollUpdateId: values.payrollUpdateId as unknown as number,
      amount: Number(values.amount as string),
      occurrenceDate: values.occurrenceDate as string,
    };

    if (isEditing && editingItem) {
      updateManual.mutate(
        { id: editingItem.id, body: payload },
        {
          onSuccess: () => {
            setEditingItem(null);
            setSelected(null);
            form.clearErrors();
            form.reset();
          },
          onError: (error) => {
            const parsed = parseApiError(error as unknown);
            Object.entries(parsed.fieldErrors || {}).forEach(([field, msg]) => {
              const key = field as keyof FormInput;
              form.setError(key, { type: "server", message: msg });
            });
          },
        },
      );
      return;
    }

    createManual.mutate(payload, {
      onSuccess: () => {
        form.clearErrors();
        form.reset();
      },
      onError: (error) => {
        const parsed = parseApiError(error as unknown);
        Object.entries(parsed.fieldErrors || {}).forEach(([field, msg]) => {
          const key = field as keyof FormInput;
          form.setError(key, { type: "server", message: msg });
        });
      },
    });
  };

  return (
    <Stack gap={6} p={4}>
      <Heading size="lg">Conceptos Manuales</Heading>

      <Card.Root variant="outline">
        <Card.Body>
          <Stack gap={4} as="form" onSubmit={form.handleSubmit(onSubmit)}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.employeeId} required>
                <Field.Label>Empleado</Field.Label>
                <Controller
                  name="employeeId"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={employeeCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(event.value[0] ? Number(event.value[0]) : 0)}
                      disabled={isPending}
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
                <Field.ErrorText>{form.formState.errors.employeeId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.payrollUpdateId} required>
                <Field.Label>Concepto Fijo</Field.Label>
                <Controller
                  name="payrollUpdateId"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={fixedConceptCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(event.value[0] ? Number(event.value[0]) : 0)}
                      disabled={isPending}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Selecciona concepto" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {fixedConceptCollection.items.map((item) => (
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
                <Field.ErrorText>{form.formState.errors.payrollUpdateId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!form.formState.errors.amount} required>
                <Field.Label>Monto (Gs.)</Field.Label>
                <Input type="number" step="1" placeholder="0" {...form.register("amount")} disabled={isPending} />
                <Field.ErrorText>{form.formState.errors.amount?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!form.formState.errors.occurrenceDate} required>
                <Field.Label>Fecha</Field.Label>
                <Input type="date" {...form.register("occurrenceDate")} disabled={isPending} />
                <Field.ErrorText>{form.formState.errors.occurrenceDate?.message}</Field.ErrorText>
              </Field.Root>
            </Grid>

            <HStack justifyContent="flex-end">
              {isEditing && (
                <Button variant="outline" onClick={cancelEdit} disabled={isPending}>
                  Cancelar
                </Button>
              )}
              <Button colorPalette="brand" type="submit" disabled={isPending}>
                {isEditing ? "Actualizar" : "Registrar Novedad"}
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Body>
          <Box display="flex" flexDirection={{ base: "column", lg: "row" }} gap={3} justifyContent="space-between" alignItems={{ base: "stretch", lg: "center" }}>
            <HStack gap={3} flex={1}>
              <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", lg: "22rem" }}>
                <Input placeholder="Buscar novedades" value={search} onChange={(event) => setSearch(event.target.value)} />
              </InputGroup>
            </HStack>

            <HStack gap={2}>
              <DestructiveActionDialog
                title="Eliminar novedad"
                description="Una vez eliminada, la acción es irreversible."
                acceptText="Eliminar"
                onAccept={onDelete}
                trigger={
                  <IconButton variant="outline" disabled={!selected || isPending}>
                    {deleteManual.isPending ? <Spinner size="sm" /> : <Trash2 size={18} />}
                    Eliminar
                  </IconButton>
                }
              />
              <IconButton variant="outline" colorPalette="brand" disabled={!selected || isPending} onClick={onEdit}>
                <Pencil size={18} />Editar
              </IconButton>
            </HStack>
          </Box>

          <Box mt={3}>
            {pendingQuery.isPending ? (
              <Text>Cargando...</Text>
            ) : pendingQuery.isError ? (
              <Text color="red.500">No se pudieron cargar las novedades pendientes.</Text>
            ) : (
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row bg="bg.subtle">
                    <Table.ColumnHeader>Funcionario</Table.ColumnHeader>
                    <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Monto</Table.ColumnHeader>
                    <Table.ColumnHeader>Estado</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered.map((item) => (
                    <Table.Row
                      key={item.id}
                      cursor="pointer"
                      bg={selected?.id === item.id ? "green.subtle" : undefined}
                      _hover={{ bg: selected?.id === item.id ? "green.subtle" : "gray.100" }}
                      onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    >
                      <Table.Cell>{item.employeeFullName ?? item.employeeId}</Table.Cell>
                      <Table.Cell>{item.conceptName ?? item.payrollUpdateId}</Table.Cell>
                      <Table.Cell>{parseDate(item.occurrenceDate)}</Table.Cell>
                      <Table.Cell textAlign="end">{parsePrice(item.amount)}</Table.Cell>
                      <Table.Cell>{manualConceptStatusLabels[item.statusName ?? ""] ?? item.statusName ?? "Pendiente"}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Box>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
