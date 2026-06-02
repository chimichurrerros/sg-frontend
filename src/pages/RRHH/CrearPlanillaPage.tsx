import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, createListCollection, Field, Grid, Heading, HStack, Input, Portal, Select, Stack, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { parseApiError } from "@/utils/api-error";
import { toaster } from "@/components/ui/toaster";
import { useCreatePayrollProcess } from "@/queries/payroll-processes.queries";
import { processTypeNameMap, ProcessTypeId, monthNameMap, PayrollStatusId } from "@/constants/payroll";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const firstDayOfMonth = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, "0")}-01`;

const createPlanillaSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  processTypeId: z.coerce.number().min(1, "El tipo es requerido"),
  year: z.coerce.number().int().min(2000, "Año inválido").max(2100, "Año inválido"),
  month: z.coerce.number().int().min(1).max(12, "Mes inválido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  payDate: z.string().optional().or(z.literal("")),
});

type CreatePlanillaFormInput = z.input<typeof createPlanillaSchema>;
type CreatePlanillaFormOutput = z.output<typeof createPlanillaSchema>;

const processTypeCollection = createListCollection({
  items: [
    { label: processTypeNameMap[ProcessTypeId.Monthly], value: String(ProcessTypeId.Monthly) },
    { label: processTypeNameMap[ProcessTypeId.Bonus], value: String(ProcessTypeId.Bonus) },
    { label: processTypeNameMap[ProcessTypeId.Settlement], value: String(ProcessTypeId.Settlement) },
  ],
});

const monthCollection = createListCollection({
  items: Array.from({ length: 12 }, (_, i) => ({
    label: monthNameMap[i + 1],
    value: String(i + 1),
  })),
});

export default function CrearPlanillaPage() {
  const navigate = useNavigate();
  const createPayrollProcess = useCreatePayrollProcess();

  const form = useForm<CreatePlanillaFormInput, unknown, CreatePlanillaFormOutput>({
    resolver: zodResolver(createPlanillaSchema),
    defaultValues: {
      name: "",
      processTypeId: ProcessTypeId.Monthly,
      year: currentYear,
      month: currentMonth,
      startDate: firstDayOfMonth(currentYear, currentMonth),
      payDate: "",
    },
  });

  const selectedYear = form.watch("year");
  const selectedMonth = form.watch("month");

  const computedStartDate = useMemo(
    () => firstDayOfMonth(selectedYear || currentYear, selectedMonth || currentMonth),
    [selectedYear, selectedMonth],
  );

  const handleSubmit = (formData: CreatePlanillaFormOutput) => {
    createPayrollProcess.mutate(
      {
        name: formData.name.trim(),
        processTypeId: formData.processTypeId,
        year: formData.year,
        month: formData.month,
        startDate: formData.payDate?.trim()
          ? formData.payDate
          : computedStartDate,
        payDate: formData.payDate?.trim() || null,
        payrollStatusId: PayrollStatusId.Open,
      },
      {
        onSuccess: (data) => {
          navigate(`/rrhh/planillas/${data.id}`);
        },
        onError: (error) => {
          const parsed = parseApiError(error);
          toaster.create({ title: "No se pudo crear la planilla", description: parsed.message, type: "error" });
        },
      },
    );
  };

  return (
    <Stack gap={5} p={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Stack gap={1}>
          <Button variant="ghost" size="sm" alignSelf="flex-start" onClick={() => navigate("/rrhh/planillas")}>
            <LuArrowLeft /> Volver
          </Button>
          <Heading size="xl">Nueva planilla</Heading>
        </Stack>
      </HStack>

      <Card.Root variant="outline" maxW="640px">
        <Card.Body>
          <Stack as="form" onSubmit={form.handleSubmit(handleSubmit)} gap={5}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!form.formState.errors.name} required>
                <Field.Label>Nombre <Text as="span" color="red.500">*</Text></Field.Label>
                <Input placeholder="PLANILLA MENSUAL ENERO 2026" {...form.register("name")} />
                <Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.processTypeId} required>
                <Field.Label>Tipo <Text as="span" color="red.500">*</Text></Field.Label>
                <Controller
                  name="processTypeId"
                  control={form.control}
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
                <Field.ErrorText>{form.formState.errors.processTypeId?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.month} required>
                <Field.Label>Mes <Text as="span" color="red.500">*</Text></Field.Label>
                <Controller
                  name="month"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={monthCollection}
                      value={field.value ? [String(field.value)] : []}
                      onValueChange={(event) => field.onChange(Number(event.value[0]))}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Seleccionar mes" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {monthCollection.items.map((item) => (
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
                <Field.ErrorText>{form.formState.errors.month?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.year} required>
                <Field.Label>Año <Text as="span" color="red.500">*</Text></Field.Label>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  placeholder="2026"
                  {...form.register("year")}
                />
                <Field.ErrorText>{form.formState.errors.year?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.startDate} required>
                <Field.Label>Fecha de Inicio <Text as="span" color="red.500">*</Text></Field.Label>
                <Input
                  type="date"
                  {...form.register("startDate")}
                />
                <Text fontSize="xs" color="fg.muted">Se calcula automáticamente según mes/año</Text>
                <Field.ErrorText>{form.formState.errors.startDate?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Fecha de Pago</Field.Label>
                <Input
                  type="date"
                  {...form.register("payDate")}
                />
                <Text fontSize="xs" color="fg.muted">Opcional</Text>
              </Field.Root>
            </Grid>

            <HStack justify="flex-end" gap={3}>
              <Button variant="outline" onClick={() => navigate("/rrhh/planillas")}>
                Cancelar
              </Button>
              <Button colorPalette="brand" type="submit" loading={createPayrollProcess.isPending}>
                <LuSave /> Crear planilla
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
