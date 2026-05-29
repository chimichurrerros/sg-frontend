import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, Field, Grid, Heading, HStack, Input, Stack, Table, Text } from "@chakra-ui/react";
import { useAllEmployees } from "@/queries/employees.queries";
import { useGetPayrollUpdates } from "@/queries/payroll-updates.queries";
import { useCreateManualConcept, useGetPendingManualConcepts } from "@/queries/manual-concepts.queries";
import { useMemo } from "react";
import { parseApiError } from "@/utils/api-error";

const manualSchema = z.object({
  employeeId: z.coerce.number().min(1, "Empleado requerido"),
  payrollUpdateId: z.coerce.number().min(1, "Concepto requerido"),
  amount: z.string().min(1, "Monto requerido"),
  occurrenceDate: z.string().min(1, "Fecha requerida"),
});

type FormInput = z.input<typeof manualSchema>;

export default function ConceptosManualesPage() {
  const { data: employeesData } = useAllEmployees();
  const { data: payrollUpdatesData } = useGetPayrollUpdates();
  const pendingQuery = useGetPendingManualConcepts();
  const createManual = useCreateManualConcept();

  const employees = employeesData?.employees ?? [];
  const fixedConcepts = useMemo(() => (payrollUpdatesData ?? []).filter((u) => u.formulaTypeId === 1), [payrollUpdatesData]);

  const form = useForm<FormInput>({ resolver: zodResolver(manualSchema), defaultValues: { employeeId: 0, payrollUpdateId: 0, amount: "", occurrenceDate: "" } });

  const onSubmit = (values: FormInput) => {
    const payload = {
      employeeId: values.employeeId,
      payrollUpdateId: values.payrollUpdateId,
      amount: Number(values.amount),
      occurrenceDate: values.occurrenceDate,
    };

    createManual.mutate(payload, {
      onSuccess: () => {
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
                    <Box
                      as="select"
                      value={field.value ? String(field.value) : ""}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      borderWidth="1px"
                      borderColor="border.default"
                      rounded="md"
                      px={3}
                      py={2}
                      w="full"
                    >
                      <option value="">Selecciona empleado</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName}
                        </option>
                      ))}
                    </Box>
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
                    <Box
                      as="select"
                      value={field.value ? String(field.value) : ""}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      borderWidth="1px"
                      borderColor="border.default"
                      rounded="md"
                      px={3}
                      py={2}
                      w="full"
                    >
                      <option value="">Selecciona concepto</option>
                      {fixedConcepts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Box>
                  )}
                />
                <Field.ErrorText>{form.formState.errors.payrollUpdateId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!form.formState.errors.amount} required>
                <Field.Label>Monto (Gs.)</Field.Label>
                <Input type="number" step="0.01" placeholder="0" {...form.register("amount")} />
                <Field.ErrorText>{form.formState.errors.amount?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!form.formState.errors.occurrenceDate} required>
                <Field.Label>Fecha</Field.Label>
                <Input type="date" {...form.register("occurrenceDate")} />
                <Field.ErrorText>{form.formState.errors.occurrenceDate?.message}</Field.ErrorText>
              </Field.Root>
            </Grid>

            <HStack justifyContent="flex-end">
              <Button colorPalette="brand" type="submit" disabled={createManual.isPending}>
                Registrar Novedad
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Body>
          <Heading size="md">Novedades Pendientes</Heading>
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
                  {(pendingQuery.data ?? []).map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.employeeFullName ?? item.employeeId}</Table.Cell>
                      <Table.Cell>{item.conceptName ?? item.payrollUpdateId}</Table.Cell>
                      <Table.Cell>{item.occurrenceDate}</Table.Cell>
                      <Table.Cell textAlign="end">{item.amount}</Table.Cell>
                      <Table.Cell>{item.statusName ?? "Pending"}</Table.Cell>
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
