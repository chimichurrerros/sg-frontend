import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  ButtonGroup,
  createListCollection,
  Field,
  Grid,
  Heading,
  HStack,
  Input,
  Portal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { LuArrowLeft, LuPlus, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/table-select";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import { toaster } from "@/components/ui/toaster";
import { useCreatePayrollUpdate, useGetPayrollUpdates } from "@/queries/payroll-updates.queries";
import type { PayrollUpdateResponseDto } from "@/api/payroll-updates.api";

const payrollTypeCollection = createListCollection({
  items: [
    { label: "HABER", value: "1" },
    { label: "DESCUENTO", value: "2" },
  ],
});

const formulaTypeCollection = createListCollection({
  items: [
    { label: "FIJO", value: "1" },
    { label: "CALCULADO", value: "2" },
  ],
});

const ipsCollection = createListCollection({
  items: [
    { label: "SÍ", value: "true" },
    { label: "NO", value: "false" },
  ],
});

const novedadSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  payrollTypeId: z.coerce.number().min(1, "El tipo es requerido"),
  formulaTypeId: z.coerce.number().min(1, "El tipo de fórmula es requerido"),
  formula: z.string().min(1, "La fórmula es requerida"),
  ipsDeductible: z.boolean(),
});

type NovedadFormInput = z.input<typeof novedadSchema>;
type NovedadFormOutput = z.output<typeof novedadSchema>;

const formulaVariables = [
  "DiasTrabajados",
  "DiasHabiles",
  "DiasTardanza",
  "DiasAusencia",
  "JornalDiario",
  "JornalMinimo",
  "SalarioBase",
  "SalarioMinimo",
  "CantidadHijos",
];

const appendVariableToFormula = (currentFormula: string, variable: string) => {
  const trimmed = currentFormula.trimEnd();
  return trimmed ? `${trimmed} ${variable}` : variable;
};

export default function NovedadesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUpdate, setSelectedUpdate] = useState<PayrollUpdateResponseDto | null>(null);

  const { data, isPending, isError, error } = useGetPayrollUpdates({ page, pageSize });
  const createPayrollUpdate = useCreatePayrollUpdate();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NovedadFormInput, any, NovedadFormOutput>({
    resolver: zodResolver(novedadSchema),
    defaultValues: {
      name: "",
      payrollTypeId: 1,
      formulaTypeId: 2,
      formula: "",
      ipsDeductible: true,
    },
  });

  const formulaTypeId = watch("formulaTypeId");
  const formulaValue = watch("formula");

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al traer novedades",
        description: error?.message || "Error desconocido",
        type: "error",
      });
    }
  }, [isError, error]);

  const labels: label<PayrollUpdateResponseDto>[] = useMemo(
    () => [
      {
        labelName: "Novedad",
        propName: "name",
        isSortable: true,
        sortFunction: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
      },
      {
        labelName: "Tipo",
        isComponent: true,
        isSortable: true,
        sortFunction: (a, b) => (a.payrollType?.name ?? "").localeCompare(b.payrollType?.name ?? ""),
        render: (item) => item.payrollType?.name ?? "-",
      },
      {
        labelName: "Deducible de IPS",
        isComponent: true,
        isSortable: true,
        sortFunction: (a, b) => Number(a.ipsDeductible) - Number(b.ipsDeductible),
        render: (item) => (item.ipsDeductible ? "SÍ" : "NO"),
      },
      {
        labelName: "Fórmula",
        propName: "formula",
        isSortable: true,
        sortFunction: (a, b) => (a.formula ?? "").localeCompare(b.formula ?? ""),
      },
    ],
    [],
  );

  const resetForm = () => {
    reset({
      name: "",
      payrollTypeId: 1,
      formulaTypeId: 2,
      formula: "",
      ipsDeductible: true,
    });
  };

  const handleVariableClick = (variable: string) => {
    setValue("formula", appendVariableToFormula(formulaValue || "", variable), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCreate = (formData: NovedadFormOutput) => {
    createPayrollUpdate.mutate(
      {
        name: formData.name.trim(),
        payrollTypeId: formData.payrollTypeId,
        formulaTypeId: formData.formulaTypeId,
        formula: formData.formula.trim(),
        ipsDeductible: formData.ipsDeductible,
      },
      {
        onSuccess: () => {
          resetForm();
        },
      },
    );
  };

  const formulaTypeLabel = formulaTypeId === 1 ? "FIJO" : "CALCULADO";
  const variablesDisabled = formulaTypeId === 1;
  const tableData = data?.payrollUpdates ?? [];

  return (
    <Stack gap={6} p={4}>
      <HStack justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={3}>
        <Stack gap={1}>
          <Text fontSize="sm" color="gray.500">
            Administración / RR.HH. / Novedades
          </Text>
          <Heading size="xl">Nueva Novedad</Heading>
        </Stack>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dash") }>
          <LuArrowLeft /> Volver
        </Button>
      </HStack>

      <Stack as="form" onSubmit={handleSubmit(handleCreate)} gap={5}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4} alignItems="start">
          <Field.Root gridColumn={{ base: "1 / -1", md: "span 5" }} invalid={!!errors.name} required>
            <Field.Label>Novedad <Text as="span" color="red.500">*</Text></Field.Label>
            <Input placeholder="BONIFICACIÓN POR PRODUCTIVIDAD" {...register("name")} disabled={createPayrollUpdate.isPending} />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!errors.payrollTypeId} required>
            <Field.Label>Tipo <Text as="span" color="red.500">*</Text></Field.Label>
            <Controller
              name="payrollTypeId"
              control={control}
              render={({ field }) => (
                <Select.Root
                  collection={payrollTypeCollection}
                  value={[String(field.value)]}
                  onValueChange={(event) => field.onChange(Number(event.value[0]))}
                  disabled={createPayrollUpdate.isPending}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Tipo" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {payrollTypeCollection.items.map((item) => (
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
            <Field.ErrorText>{errors.payrollTypeId?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!errors.ipsDeductible} required>
            <Field.Label>Deducible de IPS <Text as="span" color="red.500">*</Text></Field.Label>
            <Controller
              name="ipsDeductible"
              control={control}
              render={({ field }) => (
                <Select.Root
                  collection={ipsCollection}
                  value={[String(field.value)]}
                  onValueChange={(event) => field.onChange(event.value[0] === "true")}
                  disabled={createPayrollUpdate.isPending}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="SÍ / NO" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {ipsCollection.items.map((item) => (
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
            <Field.ErrorText>{errors.ipsDeductible?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root gridColumn={{ base: "1 / -1", md: "span 3" }} invalid={!!errors.formulaTypeId} required>
            <Field.Label>Tipo de Fórmula <Text as="span" color="red.500">*</Text></Field.Label>
            <Controller
              name="formulaTypeId"
              control={control}
              render={({ field }) => (
                <Select.Root
                  collection={formulaTypeCollection}
                  value={[String(field.value)]}
                  onValueChange={(event) => field.onChange(Number(event.value[0]))}
                  disabled={createPayrollUpdate.isPending}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Tipo de fórmula" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {formulaTypeCollection.items.map((item) => (
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
            <Field.ErrorText>{errors.formulaTypeId?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root gridColumn={{ base: "1 / -1", md: "span 6" }} invalid={!!errors.formula} required>
            <Field.Label>Fórmula <Text as="span" color="red.500">*</Text></Field.Label>
            <Textarea
              {...register("formula")}
              placeholder={formulaTypeLabel === "FIJO" ? "Ej. 50000" : "Ej. DiasTrabajados * JornalMinimo"}
              rows={5}
              disabled={createPayrollUpdate.isPending}
            />
            <Field.ErrorText>{errors.formula?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root gridColumn={{ base: "1 / -1", md: "span 6" }}>
            <Field.Label>Variables Disponibles</Field.Label>
            <Box
              borderWidth="1px"
              borderColor="gray.200"
              rounded="md"
              p={3}
              opacity={variablesDisabled ? 0.45 : 1}
              pointerEvents={variablesDisabled ? "none" : "auto"}
              bg={variablesDisabled ? "gray.50" : "white"}
            >
              <Text fontSize="sm" color="gray.500" mb={3}>
                Haz clic en una variable para añadirla al final de la fórmula.
              </Text>
              <HStack wrap="wrap" gap={2} alignItems="start">
                {formulaVariables.map((variable) => (
                  <Button
                    key={variable}
                    size="xs"
                    variant="outline"
                    onClick={() => handleVariableClick(variable)}
                    disabled={variablesDisabled || createPayrollUpdate.isPending}
                  >
                    {variable}
                  </Button>
                ))}
              </HStack>
            </Box>
          </Field.Root>
        </Grid>

        <ButtonGroup justifyContent="space-between">
          <Button variant="outline" onClick={resetForm} disabled={createPayrollUpdate.isPending}>
            Cancelar
          </Button>
          <Button colorPalette="brand" type="submit" disabled={createPayrollUpdate.isPending}>
            {createPayrollUpdate.isPending ? <LuPlus /> : <LuSave />}
            Guardar
          </Button>
        </ButtonGroup>
      </Stack>

      <Stack gap={3}>
        <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
          <Heading size="md">Conceptos de Nómina</Heading>
          <PageSizeControl
            params={{ page, pageSize }}
            paramsChangeFunction={(next) => {
              setPageSize(next.pageSize ?? 10);
              setPage(1);
            }}
            min={5}
            max={30}
          />
        </HStack>

        <TableSelect
          data={tableData}
          labels={labels}
          loading={isPending}
          onSelect={setSelectedUpdate}
          noItemsComponent={<EmptyDataScreen title="No hay novedades" message="Crea una novedad para empezar a usar los conceptos de nómina." />}
          maxHeight="50vh"
        />

        <PaginationControl
          pagination={data?.pagination ?? null}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      </Stack>
    </Stack>
  );
}