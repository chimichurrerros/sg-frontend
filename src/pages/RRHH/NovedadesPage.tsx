import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  Portal,
  Select,
  Spinner,
  Stack,
  Table,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { LuArrowLeft, LuCalculator, LuPencil, LuPlus, LuRefreshCw, LuSave, LuTrash2 } from "react-icons/lu";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TableSelect, { type label } from "@/components/ui/table-select";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { toaster } from "@/components/ui/toaster";
import { useAllEmployees } from "@/queries/employees.queries";
import { useCalculatePayrollProcess, useDeletePayrollProcessManualDetail, useGetPayrollProcess, useGetPayrollProcessManualDetails, useUpsertPayrollProcessManualDetail } from "@/queries/payroll-processes.queries";
import { useGetPendingManualConcepts } from "@/queries/manual-concepts.queries";
import { useCreatePayrollUpdate, useGetPayrollUpdates, useUpdatePayrollUpdate } from "@/queries/payroll-updates.queries";
import type { PayrollUpdateResponseDto } from "@/api/payroll-updates.api";
import type { PayrollProcessCalculationSummaryDto, PayrollProcessManualDetailResponseDto } from "@/api/payroll-processes.api";
import { parseApiError } from "@/utils/api-error";

const payrollTypeCollection = createListCollection({
  items: [
    { label: "Haberes", value: "1" },
    { label: "Descuentos", value: "2" },
  ],
});

const formulaTypeCollection = createListCollection({
  items: [
    { label: "Fijo", value: "1" },
    { label: "Calculado", value: "2" },
  ],
});

const ipsCollection = createListCollection({
  items: [
    { label: "Sí", value: "true" },
    { label: "No", value: "false" },
  ],
});

const PayrollTypeId = {
  Earnings: 1,
  Deductions: 2,
} as const;

const FormulaTypeId = {
  Fixed: 1,
  Calculated: 2,
} as const;

const defaultPayrollUpdateFormValues = {
  name: "",
  payrollTypeId: PayrollTypeId.Earnings,
  formulaTypeId: FormulaTypeId.Calculated,
  formula: "",
  ipsDeductible: true,
};

const defaultManualFormValues = {
  employeeId: 0,
  payrollUpdateId: 0,
  amount: "",
};

const payrollTypeNameMap: Record<number, string> = {
  [PayrollTypeId.Earnings]: "Haberes",
  [PayrollTypeId.Deductions]: "Descuentos",
};

const formulaTypeNameMap: Record<number, string> = {
  [FormulaTypeId.Fixed]: "Fijo",
  [FormulaTypeId.Calculated]: "Calculado",
};

const payrollUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es requerido"),
    payrollTypeId: z.coerce.number().min(1, "El tipo es requerido"),
    formulaTypeId: z.coerce.number().min(1, "El tipo de fórmula es requerido"),
    formula: z.string().min(1, "La fórmula es requerida"),
    ipsDeductible: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.formulaTypeId === FormulaTypeId.Calculated && !data.formula?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["formula"], message: "La fórmula es requerida" });
    }

    if (data.payrollTypeId === PayrollTypeId.Deductions && data.ipsDeductible) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ipsDeductible"], message: "El IPS deducible no aplica para descuentos" });
    }
  });

const manualDetailSchema = z.object({
  employeeId: z.coerce.number().min(1, "El empleado es requerido"),
  payrollUpdateId: z.coerce.number().min(1, "El concepto es requerido"),
  amount: z
    .string()
    .min(1, "El monto es requerido")
    .refine((value) => Number.isFinite(Number(value)), "El monto es inválido")
    .transform((value) => Number(value)),
});

type PayrollUpdateFormInput = z.input<typeof payrollUpdateSchema>;
type PayrollUpdateFormOutput = z.output<typeof payrollUpdateSchema>;
type ManualDetailFormInput = z.input<typeof manualDetailSchema>;
type ManualDetailFormOutput = z.output<typeof manualDetailSchema>;

const formulaVariables = [
  "DiasTrabajados",
  "DiasHabiles",
  "DiasTardanza",
  "DiasAusencia",
  "JornalDiario",
  "JornalMinimo",
  "CantidadHijos",
];

const payrollSectionConfig = {
  novedades: {
    path: "/rrhh/novedades",
    title: "Novedades",
    description: "Crea y administra los conceptos de nómina con fórmulas fijas o calculadas.",
  },
  manuales: {
    path: "/rrhh/conceptos-manuales",
    title: "Conceptos Manuales",
    description: "Asigna conceptos fijos por funcionario y período para el proceso de nómina.",
  },
  planillas: {
    path: "/rrhh/planillas",
    title: "Planillas",
    description: "Ejecuta el cálculo de la planilla y revisa el resultado antes de pagar.",
  },
} as const;

type PayrollSectionKey = keyof typeof payrollSectionConfig;

const getPayrollSectionKey = (pathname: string): PayrollSectionKey => {
  if (pathname.includes("/conceptos-manuales")) {
    return "manuales";
  }

  if (pathname.includes("/planillas")) {
    return "planillas";
  }

  return "novedades";
};

const appendVariableToFormula = (currentFormula: string, variable: string) => {
  const trimmed = currentFormula.trimEnd();
  return trimmed ? `${trimmed} ${variable}` : variable;
};

const normalizeProcessStatus = (value?: string | null) => (value ?? "").toLowerCase();

const isProcessOpen = (process?: { isOpen?: boolean | null; status?: string | null; statusName?: string | null; state?: string | null; stateName?: string | null } | null) => {
  if (!process) {
    return false;
  }

  if (process.isOpen !== undefined && process.isOpen !== null) {
    return process.isOpen;
  }

  const statusText = normalizeProcessStatus(process.statusName ?? process.status ?? process.stateName ?? process.state);
  if (!statusText) {
    return true;
  }

  return !/(cerrad|closed|procesad|finaliz|complet|terminad)/.test(statusText);
};

const statusLabelFromProcess = (process?: { status?: string | null; statusName?: string | null; state?: string | null; stateName?: string | null } | null) => {
  const text = process?.statusName ?? process?.status ?? process?.stateName ?? process?.state;
  return text && text.trim().length > 0 ? text : "Sin estado";
};

const formatApiMessage = (error: unknown, fallback: string) => {
  const parsed = parseApiError(error);
  return {
    ...parsed,
    message: parsed.message || fallback,
  };
};

export default function NovedadesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUpdate, setSelectedUpdate] = useState<PayrollUpdateResponseDto | null>(null);
  const [selectedManualDetail, setSelectedManualDetail] = useState<PayrollProcessManualDetailResponseDto | null>(null);
  const [calculationSummary, setCalculationSummary] = useState<PayrollProcessCalculationSummaryDto | null>(null);
  const [processIdInput, setProcessIdInput] = useState(searchParams.get("processId") ?? "");

  const selectedProcessId = useMemo(() => {
    const parsed = Number(searchParams.get("processId") ?? "");
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const activeSection = useMemo(() => getPayrollSectionKey(location.pathname), [location.pathname]);
  const sectionConfig = payrollSectionConfig[activeSection];
  const showProcessSection = activeSection !== "novedades";
  const showConceptsSection = activeSection === "novedades";
  const showManualsSection = activeSection === "manuales";
  const showPlanillasSection = activeSection === "planillas";

  const payrollUpdatesQuery = useGetPayrollUpdates();
  const employeesQuery = useAllEmployees();
  const processQuery = useGetPayrollProcess(selectedProcessId ?? undefined);
  const manualDetailsQuery = useGetPayrollProcessManualDetails(selectedProcessId ?? undefined);
  const pendingManualsQuery = useGetPendingManualConcepts();
  const createPayrollUpdate = useCreatePayrollUpdate();
  const updatePayrollUpdate = useUpdatePayrollUpdate();
  const upsertManualDetail = useUpsertPayrollProcessManualDetail(selectedProcessId ?? undefined);
  const deleteManualDetail = useDeletePayrollProcessManualDetail(selectedProcessId ?? undefined);
  const calculatePayrollProcess = useCalculatePayrollProcess(selectedProcessId ?? undefined);

  const payrollUpdates = useMemo(() => payrollUpdatesQuery.data ?? [], [payrollUpdatesQuery.data]);
  const payrollVariables = formulaVariables;
  const employees = useMemo(() => employeesQuery.data?.employees ?? [], [employeesQuery.data]);
  const manualDetails = manualDetailsQuery.data ?? [];
  const process = processQuery.data ?? null;
  const processOpen = isProcessOpen(process);
  const processLabel = statusLabelFromProcess(process);
  const manualFormDisabled = !selectedProcessId || !processOpen;
  const conceptIsEditing = Boolean(selectedUpdate);

  const payrollUpdateLabels: label<PayrollUpdateResponseDto>[] = useMemo(
    () => [
      {
        labelName: "Nombre",
        propName: "name",
        isSortable: true,
        sortFunction: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
      },
      {
        labelName: "Tipo",
        isComponent: true,
        isSortable: true,
        sortFunction: (a, b) => (payrollTypeNameMap[a.payrollTypeId] ?? "").localeCompare(payrollTypeNameMap[b.payrollTypeId] ?? ""),
        render: (item) => payrollTypeNameMap[item.payrollTypeId] ?? item.payrollTypeName ?? "-",
      },
      {
        labelName: "Tipo de Fórmula",
        isComponent: true,
        isSortable: true,
        sortFunction: (a, b) => (formulaTypeNameMap[a.formulaTypeId] ?? "").localeCompare(formulaTypeNameMap[b.formulaTypeId] ?? ""),
        render: (item) => formulaTypeNameMap[item.formulaTypeId] ?? item.formulaTypeName ?? "-",
      },
      {
        labelName: "IPS Deducible",
        isComponent: true,
        isSortable: true,
        sortFunction: (a, b) => Number(a.ipsDeductible) - Number(b.ipsDeductible),
        render: (item) => (item.ipsDeductible ? "Sí" : "No"),
      },
      {
        labelName: "Fórmula",
        propName: "formula",
        isSortable: true,
        sortFunction: (a, b) => (a.formula ?? "").localeCompare(b.formula ?? ""),
        textIfNull: "-",
      },
    ],
    [],
  );

  const manualConceptCollection = useMemo(
    () =>
      createListCollection({
        items: payrollUpdates
          .filter((update) => update.formulaTypeId === FormulaTypeId.Fixed)
          .map((update) => ({
            label: `${update.name} (${payrollTypeNameMap[update.payrollTypeId] ?? update.payrollTypeName ?? "-"})`,
            value: String(update.id),
          })),
      }),
    [payrollUpdates],
  );

  const employeeCollection = useMemo(
    () =>
      createListCollection({
        items: employees.map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} - ${employee.legajo || employee.documentNumber}`,
          value: String(employee.id),
        })),
      }),
    [employees],
  );

  const payrollUpdateForm = useForm<PayrollUpdateFormInput, unknown, PayrollUpdateFormOutput>({
    resolver: zodResolver(payrollUpdateSchema),
    defaultValues: defaultPayrollUpdateFormValues,
  });

  const manualDetailForm = useForm<ManualDetailFormInput, unknown, ManualDetailFormOutput>({
    resolver: zodResolver(manualDetailSchema),
    defaultValues: defaultManualFormValues,
  });

  const payrollRegister = payrollUpdateForm.register;
  const payrollControl = payrollUpdateForm.control;
  const payrollHandleSubmit = payrollUpdateForm.handleSubmit;
  const payrollReset = payrollUpdateForm.reset;
  const payrollSetValue = payrollUpdateForm.setValue;
  const payrollGetValues = payrollUpdateForm.getValues;
  const payrollSetError = payrollUpdateForm.setError;

  const manualRegister = manualDetailForm.register;
  const manualControl = manualDetailForm.control;
  const manualHandleSubmit = manualDetailForm.handleSubmit;
  const manualReset = manualDetailForm.reset;
  const manualSetError = manualDetailForm.setError;

  const payrollTypeId = useWatch({ control: payrollControl, name: "payrollTypeId" }) ?? PayrollTypeId.Earnings;
  const formulaTypeId = useWatch({ control: payrollControl, name: "formulaTypeId" }) ?? FormulaTypeId.Calculated;
  const formulaValue = useWatch({ control: payrollControl, name: "formula" }) ?? "";

  const applyPayrollFieldErrors = (fieldErrors: Record<string, string>) => {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      payrollSetError(field as never, { type: "server", message });
    });
  };

  const applyManualFieldErrors = (fieldErrors: Record<string, string>) => {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      manualSetError(field as never, { type: "server", message });
    });
  };

  useEffect(() => {
    if (payrollUpdatesQuery.isError) {
      const parsed = formatApiMessage(payrollUpdatesQuery.error, "No se pudieron cargar los conceptos de nómina");
      toaster.create({ title: "Error al traer conceptos", description: parsed.message, type: "error" });
    }
  }, [payrollUpdatesQuery.isError, payrollUpdatesQuery.error]);

  useEffect(() => {
    if (employeesQuery.isError) {
      const parsed = formatApiMessage(employeesQuery.error, "No se pudieron cargar los empleados");
      toaster.create({ title: "Error al traer empleados", description: parsed.message, type: "error" });
    }
  }, [employeesQuery.isError, employeesQuery.error]);

  useEffect(() => {
    if (processQuery.isError && selectedProcessId) {
      const parsed = formatApiMessage(processQuery.error, "No se pudo cargar el proceso seleccionado");
      toaster.create({ title: "Error al traer proceso", description: parsed.message, type: "error" });
    }
  }, [processQuery.isError, processQuery.error, selectedProcessId]);

  useEffect(() => {
    if (manualDetailsQuery.isError && selectedProcessId) {
      const parsed = formatApiMessage(manualDetailsQuery.error, "No se pudieron cargar los manuales del proceso");
      toaster.create({ title: "Error al traer manuales", description: parsed.message, type: "error" });
    }
  }, [manualDetailsQuery.isError, manualDetailsQuery.error, selectedProcessId]);

  useEffect(() => {
    if (selectedUpdate) {
      payrollReset({
        name: selectedUpdate.name ?? "",
        payrollTypeId: selectedUpdate.payrollTypeId,
        formulaTypeId: selectedUpdate.formulaTypeId,
        formula: selectedUpdate.formula ?? "",
        ipsDeductible: selectedUpdate.ipsDeductible,
      });
      return;
    }

    payrollReset(defaultPayrollUpdateFormValues);
  }, [selectedUpdate, payrollReset]);

  useEffect(() => {
    if (payrollTypeId === PayrollTypeId.Deductions && payrollGetValues("ipsDeductible") !== false) {
      payrollSetValue("ipsDeductible", false, { shouldDirty: true, shouldValidate: true });
    }
  }, [payrollTypeId, payrollGetValues, payrollSetValue]);

  useEffect(() => {
    if (!selectedProcessId) {
      manualReset(defaultManualFormValues);
      return;
    }

    manualReset({
      employeeId: selectedManualDetail?.employeeId ?? 0,
      payrollUpdateId: selectedManualDetail?.payrollUpdateId ?? 0,
      amount: selectedManualDetail ? String(selectedManualDetail.amount) : "",
    });
  }, [selectedProcessId, manualReset, selectedManualDetail]);

  const resetPayrollUpdateForm = () => {
    setSelectedUpdate(null);
    payrollReset(defaultPayrollUpdateFormValues);
  };

  const handleFormulaVariableClick = (variable: string) => {
    payrollSetValue("formula", appendVariableToFormula(formulaValue || "", variable), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSavePayrollUpdate = (formData: PayrollUpdateFormOutput) => {
    const payload = {
      name: formData.name.trim(),
      payrollTypeId: formData.payrollTypeId,
      formulaTypeId: formData.formulaTypeId,
      formula: formData.formula.trim(),
      ipsDeductible: formData.payrollTypeId === PayrollTypeId.Deductions ? false : formData.ipsDeductible,
    };

    const successHandler = () => {
      resetPayrollUpdateForm();
    };

    if (selectedUpdate) {
      updatePayrollUpdate.mutate(
        { id: selectedUpdate.id, body: payload },
        {
          onSuccess: successHandler,
          onError: (error) => {
            const parsed = parseApiError(error);
            applyPayrollFieldErrors(parsed.fieldErrors);
            toaster.create({ title: "No se pudo actualizar el concepto", description: parsed.message, type: "error" });
          },
        },
      );
      return;
    }

    createPayrollUpdate.mutate(payload, {
      onSuccess: successHandler,
      onError: (error) => {
        const parsed = parseApiError(error);
        applyPayrollFieldErrors(parsed.fieldErrors);
        toaster.create({ title: "No se pudo crear el concepto", description: parsed.message, type: "error" });
      },
    });
  };

  const handleLoadProcess = () => {
    const parsed = Number(processIdInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toaster.create({ title: "Ingresa un ID de proceso válido", type: "error" });
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("processId", String(parsed));
    setSearchParams(nextParams);
  };

  const handleSaveManualDetail = (formData: ManualDetailFormOutput) => {
    if (!selectedProcessId) {
      toaster.create({ title: "Selecciona un proceso de nómina", type: "error" });
      return;
    }

    if (!processOpen) {
      toaster.create({ title: "El proceso no está abierto", description: "No puedes cargar manuales mientras el proceso esté cerrado o procesado.", type: "error" });
      return;
    }

    const selectedConcept = payrollUpdates.find((update) => update.id === formData.payrollUpdateId);
    if (!selectedConcept) {
      manualSetError("payrollUpdateId", { type: "manual", message: "Selecciona un concepto válido" });
      toaster.create({ title: "Concepto inválido", description: "El concepto seleccionado no existe.", type: "error" });
      return;
    }

    if (selectedConcept.formulaTypeId !== FormulaTypeId.Fixed) {
      manualSetError("payrollUpdateId", { type: "manual", message: "Solo se permiten conceptos fijos" });
      toaster.create({ title: "Concepto no permitido", description: "Los manuales sólo aceptan conceptos Fijo.", type: "error" });
      return;
    }

    upsertManualDetail.mutate(
      {
        employeeId: formData.employeeId,
        payrollUpdateId: formData.payrollUpdateId,
        amount: formData.amount,
      },
      {
        onSuccess: () => {
          manualDetailForm.reset(defaultManualFormValues);
          setSelectedManualDetail(null);
        },
        onError: (error) => {
          const parsed = parseApiError(error);
          applyManualFieldErrors(parsed.fieldErrors);
          const statusMessage =
            parsed.status === 404
              ? "El proceso o el detalle manual no fue encontrado"
              : parsed.status === 409
                ? "El proceso está bloqueado para cambios"
                : parsed.status === 400
                  ? "Hay datos inválidos en el manual"
                  : parsed.message;

          toaster.create({ title: "No se pudo guardar el manual", description: statusMessage, type: "error" });
        },
      },
    );
  };

  const handleDeleteManualDetail = (manualDetail: PayrollProcessManualDetailResponseDto) => {
    deleteManualDetail.mutate(manualDetail.id, {
      onSuccess: () => {
        if (selectedManualDetail?.id === manualDetail.id) {
          setSelectedManualDetail(null);
          manualDetailForm.reset(defaultManualFormValues);
        }
      },
      onError: (error) => {
        const parsed = parseApiError(error);
        const message =
          parsed.status === 404
            ? "El detalle manual no existe o ya fue eliminado"
            : parsed.status === 409
              ? "El proceso no permite eliminar manuales en este estado"
              : parsed.status === 400
                ? "El backend rechazó el borrado por validación"
                : parsed.message;
        toaster.create({ title: "No se pudo eliminar el manual", description: message, type: "error" });
      },
    });
  };

  const handleCalculateProcess = () => {
    if (!selectedProcessId) {
      toaster.create({ title: "Selecciona un proceso antes de calcular", type: "error" });
      return;
    }

    if (!processOpen) {
      toaster.create({ title: "El proceso no está abierto", description: "No se puede ejecutar el cálculo masivo en un proceso cerrado o procesado.", type: "error" });
      return;
    }

    if (manualDetails.length === 0) {
      toaster.create({ title: "Carga manuales antes de calcular", description: "Este proceso aún no tiene novedades manuales cargadas.", type: "error" });
      return;
    }

    calculatePayrollProcess.mutate(undefined, {
      onSuccess: (result) => {
        setCalculationSummary(result);
      },
      onError: (error) => {
        const parsed = parseApiError(error);
        const message =
          parsed.status === 404
            ? "El proceso no fue encontrado"
            : parsed.status === 409
              ? "El cálculo no puede ejecutarse porque el proceso está bloqueado"
              : parsed.status === 400
                ? "El proceso no cumple con las validaciones para calcular"
                : parsed.message;
        toaster.create({ title: "No se pudo calcular la nómina", description: message, type: "error" });
      },
    });
  };

  const renderCalculationSummary = () => {
    if (!calculationSummary) {
      return <Text color="gray.500">Aún no se ejecutó el cálculo masivo para este proceso.</Text>;
    }

    const resultDetails = calculationSummary.details ?? [];

    return (
      <Stack gap={3}>
        <Text>{calculationSummary.message || calculationSummary.summary || "Cálculo ejecutado correctamente."}</Text>
        <HStack wrap="wrap" gap={3}>
          {typeof calculationSummary.totalEmployees === "number" && <Badge colorPalette="green">Empleados: {calculationSummary.totalEmployees}</Badge>}
          {typeof calculationSummary.totalManualDetails === "number" && <Badge colorPalette="blue">Manuales: {calculationSummary.totalManualDetails}</Badge>}
          {typeof calculationSummary.totalConcepts === "number" && <Badge colorPalette="purple">Conceptos: {calculationSummary.totalConcepts}</Badge>}
        </HStack>
        {resultDetails.length > 0 ? (
          <Box borderWidth="1px" borderColor="gray.200" rounded="md" overflow="hidden">
            <Table.ScrollArea>
              <Table.Root size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row bg="bg.subtle">
                    <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                    <Table.ColumnHeader>ID</Table.ColumnHeader>
                    <Table.ColumnHeader>Mensaje</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {resultDetails.map((detail, index) => (
                    <Table.Row key={`${detail.employeeId ?? index}-${index}`}>
                      <Table.Cell>{detail.employeeFullName ?? "-"}</Table.Cell>
                      <Table.Cell>{detail.employeeId ?? "-"}</Table.Cell>
                      <Table.Cell>{detail.message ?? "Procesado"}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>
        ) : (
          <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
            <Text whiteSpace="pre-wrap" fontSize="sm">
              {JSON.stringify(calculationSummary, null, 2)}
            </Text>
          </Box>
        )}
      </Stack>
    );
  };

  const payrollUpdatePending = createPayrollUpdate.isPending || updatePayrollUpdate.isPending;
  const manualPending = upsertManualDetail.isPending || deleteManualDetail.isPending || calculatePayrollProcess.isPending;
  const conceptManualOptions = payrollUpdates.filter((update) => update.formulaTypeId === FormulaTypeId.Fixed);
  const formulaTypeLabel = formulaTypeId === FormulaTypeId.Fixed ? "FIJO" : "CALCULADO";
  const variablesDisabled = formulaTypeId === FormulaTypeId.Fixed;

  return (
    <Stack gap={6} p={4}>
      <HStack justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={3}>
        <Stack gap={1}>
          <Text fontSize="sm" color="gray.500">
            Administración / RR.HH. / Nómina
          </Text>
          <Heading size="xl">{sectionConfig.title}</Heading>
          <Text fontSize="sm" color="gray.500">
            {sectionConfig.description}
          </Text>
        </Stack>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dash") }>
          <LuArrowLeft /> Volver
        </Button>
      </HStack>

      {showConceptsSection && (
        <>
          <Card.Root variant="outline">
            <Card.Body>
              <Stack gap={5}>
                <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
                  <Stack gap={1}>
                    <Heading size="md">{conceptIsEditing ? `Editar concepto #${selectedUpdate?.id}` : "Crear concepto de nómina"}</Heading>
                    <Text fontSize="sm" color="gray.500">
                      Usa Haberes / Descuentos y Fijo / Calculado para controlar la validación automática del formulario.
                    </Text>
                  </Stack>
                  {conceptIsEditing ? (
                    <Button variant="outline" onClick={resetPayrollUpdateForm}>
                      <LuRefreshCw /> Cancelar edición
                    </Button>
                  ) : null}
                </HStack>

                <Stack as="form" onSubmit={payrollHandleSubmit(handleSavePayrollUpdate)} gap={5}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4} alignItems="start">
                <Field.Root gridColumn={{ base: "1 / -1", md: "span 5" }} invalid={!!payrollUpdateForm.formState.errors.name} required>
                  <Field.Label>Nombre <Text as="span" color="red.500">*</Text></Field.Label>
                  <Input placeholder="BONIFICACIÓN POR PRODUCTIVIDAD" {...payrollRegister("name")} disabled={payrollUpdatePending} />
                  <Field.ErrorText>{payrollUpdateForm.formState.errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!payrollUpdateForm.formState.errors.payrollTypeId} required>
                  <Field.Label>Tipo <Text as="span" color="red.500">*</Text></Field.Label>
                  <Controller
                    name="payrollTypeId"
                    control={payrollControl}
                    render={({ field }) => (
                      <Select.Root
                        collection={payrollTypeCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={payrollUpdatePending}
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
                  <Field.ErrorText>{payrollUpdateForm.formState.errors.payrollTypeId?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 2" }} invalid={!!payrollUpdateForm.formState.errors.ipsDeductible} required={payrollTypeId !== PayrollTypeId.Deductions}>
                  <Field.Label>IPS Deducible {payrollTypeId === PayrollTypeId.Deductions ? <Text as="span" color="gray.500">(forzado en No)</Text> : <Text as="span" color="red.500">*</Text>}</Field.Label>
                  <Controller
                    name="ipsDeductible"
                    control={payrollControl}
                    render={({ field }) => (
                      <Select.Root
                        collection={ipsCollection}
                        value={[String(field.value)]}
                        onValueChange={(event) => field.onChange(event.value[0] === "true")}
                        disabled={payrollUpdatePending || payrollTypeId === PayrollTypeId.Deductions}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Sí / No" />
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
                  <Field.ErrorText>{payrollUpdateForm.formState.errors.ipsDeductible?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 3" }} invalid={!!payrollUpdateForm.formState.errors.formulaTypeId} required>
                  <Field.Label>Tipo de Fórmula <Text as="span" color="red.500">*</Text></Field.Label>
                  <Controller
                    name="formulaTypeId"
                    control={payrollControl}
                    render={({ field }) => (
                      <Select.Root
                        collection={formulaTypeCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={payrollUpdatePending}
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
                  <Field.ErrorText>{payrollUpdateForm.formState.errors.formulaTypeId?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 6" }} invalid={!!payrollUpdateForm.formState.errors.formula} required>
                  <Field.Label>Fórmula <Text as="span" color="red.500">*</Text></Field.Label>
                  <Textarea
                    {...payrollRegister("formula")}
                    placeholder={formulaTypeLabel === "FIJO" ? "Ej. 50000" : "Ej. DiasTrabajados * JornalMinimo"}
                    rows={5}
                    disabled={payrollUpdatePending}
                  />
                  <Field.ErrorText>{payrollUpdateForm.formState.errors.formula?.message}</Field.ErrorText>
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
                      {payrollVariables.map((variable) => (
                        <Button
                          key={variable}
                          size="xs"
                          variant="outline"
                          onClick={() => handleFormulaVariableClick(variable)}
                          disabled={variablesDisabled || payrollUpdatePending}
                        >
                          {variable}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                </Field.Root>
              </Grid>

              <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
                <Button variant="outline" onClick={resetPayrollUpdateForm} disabled={payrollUpdatePending}>
                  Cancelar
                </Button>
                <Button colorPalette="brand" type="submit" disabled={payrollUpdatePending}>
                  {payrollUpdatePending ? <LuPlus /> : <LuSave />}
                  {conceptIsEditing ? "Actualizar" : "Guardar"}
                </Button>
              </HStack>
            </Stack>
          </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Body>
              <Stack gap={4}>
                <Heading size="md">Conceptos de nómina</Heading>
                <TableSelect
                  data={payrollUpdates}
                  labels={payrollUpdateLabels}
                  loading={payrollUpdatesQuery.isPending}
                  onSelect={setSelectedUpdate}
                  onDoubleClick={setSelectedUpdate}
                  noItemsComponent={<EmptyDataScreen title="No hay conceptos" message="Crea un concepto para empezar a usar la nómina." />}
                  maxHeight="50vh"
                />
              </Stack>
            </Card.Body>
          </Card.Root>
        </>
      )}

      {showProcessSection && (
        <Card.Root variant="outline">
          <Card.Body>
            <Stack gap={4}>
              <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
                <Stack gap={1}>
                  <Heading size="md">Proceso de nómina</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Carga el proceso existente para gestionar manuales y ejecutar el cálculo masivo.
                  </Text>
                </Stack>
                {selectedProcessId ? (
                  <HStack gap={2}>
                    <Badge colorPalette={processOpen ? "green" : "red"}>{processLabel}</Badge>
                    <Text fontSize="sm" color="gray.500">
                      Proceso #{selectedProcessId}
                    </Text>
                  </HStack>
                ) : null}
              </HStack>

              <HStack gap={3} flexWrap="wrap">
                <Input
                  type="number"
                  min={1}
                  value={processIdInput}
                  onChange={(event) => setProcessIdInput(event.target.value)}
                  placeholder="ID del proceso"
                  maxW="220px"
                />
                <Button colorPalette="brand" onClick={handleLoadProcess}>
                  Cargar proceso
                </Button>
                {selectedProcessId ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchParams(new URLSearchParams());
                      setProcessIdInput("");
                    }}
                  >
                    Limpiar
                  </Button>
                ) : null}
              </HStack>

              <Text fontSize="sm" color={selectedProcessId && !processOpen ? "red.500" : "gray.500"}>
                {selectedProcessId
                  ? processOpen
                    ? "El proceso está habilitado para cargar manuales y ejecutar el cálculo."
                    : "El proceso está cerrado o procesado; la carga, edición y borrado de manuales quedan deshabilitados."
                  : "Selecciona un proceso para ver manuales, cargar novedades y ejecutar el cálculo."}
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {showManualsSection && (
        <Card.Root variant="outline">
          <Card.Body>
            <Stack gap={5}>
              <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
                <Stack gap={1}>
                  <Heading size="md">Manuales del proceso</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Sólo se permiten conceptos Fijo. Si el concepto es Calculado, la acción queda bloqueada desde la UI.
                  </Text>
                </Stack>
                <HStack gap={2}>
                  {manualPending ? <Spinner size="sm" /> : null}
                  <Badge colorPalette={processOpen ? "green" : "red"}>{selectedProcessId ? processLabel : "Sin proceso"}</Badge>
                </HStack>
              </HStack>

              <Stack as="form" gap={4} onSubmit={manualHandleSubmit(handleSaveManualDetail)}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4} alignItems="start">
                <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!manualDetailForm.formState.errors.employeeId} required>
                  <Field.Label>Empleado <Text as="span" color="red.500">*</Text></Field.Label>
                  <Controller
                    name="employeeId"
                    control={manualControl}
                    render={({ field }) => (
                      <Select.Root
                        collection={employeeCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={manualFormDisabled}
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
                  <Field.ErrorText>{manualDetailForm.formState.errors.employeeId?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 5" }} invalid={!!manualDetailForm.formState.errors.payrollUpdateId} required>
                  <Field.Label>Concepto <Text as="span" color="red.500">*</Text></Field.Label>
                  <Controller
                    name="payrollUpdateId"
                    control={manualControl}
                    render={({ field }) => (
                      <Select.Root
                        collection={manualConceptCollection}
                        value={field.value ? [String(field.value)] : []}
                        onValueChange={(event) => field.onChange(Number(event.value[0]))}
                        disabled={manualFormDisabled || conceptManualOptions.length === 0}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Sólo conceptos Fijo" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content>
                              {manualConceptCollection.items.map((item) => (
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
                  <Field.ErrorText>{manualDetailForm.formState.errors.payrollUpdateId?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root gridColumn={{ base: "1 / -1", md: "span 3" }} invalid={!!manualDetailForm.formState.errors.amount} required>
                  <Field.Label>Monto <Text as="span" color="red.500">*</Text></Field.Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    {...manualRegister("amount")}
                    disabled={manualFormDisabled}
                  />
                  <Field.ErrorText>{manualDetailForm.formState.errors.amount?.message}</Field.ErrorText>
                </Field.Root>
              </Grid>

              <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
                <Text fontSize="sm" color="gray.500">
                  {selectedProcessId
                    ? processOpen
                      ? `Proceso ${selectedProcessId} listo para cargar manuales.`
                      : `Proceso ${selectedProcessId} bloqueado. No se permiten cambios.`
                    : "Selecciona un proceso para cargar manuales."}
                </Text>
                <HStack gap={2}>
                  {selectedProcessId ? (
                    <Button variant="outline" onClick={() => { setSelectedManualDetail(null); manualReset(defaultManualFormValues); }} disabled={manualFormDisabled}>
                      <LuRefreshCw /> Limpiar
                    </Button>
                  ) : null}
                  <Button colorPalette="brand" type="submit" disabled={manualFormDisabled || upsertManualDetail.isPending}>
                    {upsertManualDetail.isPending ? <Spinner size="sm" /> : <LuPlus />}
                    Guardar detalle
                  </Button>
                </HStack>
              </HStack>
            </Stack>
              <Box borderWidth="1px" borderColor="gray.200" rounded="md" overflow="hidden">
                {manualDetailsQuery.isPending ? (
                  <Box p={6} textAlign="center">
                    <Spinner />
                    <Text mt={2} color="gray.500">
                      Cargando manuales del período...
                    </Text>
                  </Box>
                ) : manualDetailsQuery.isError ? (
                  <Box p={6}>
                    <Text color="red.500" fontWeight="semibold">
                      No se pudieron cargar los manuales del proceso.
                    </Text>
                    <Text color="gray.500" mt={1}>
                      Revisa el ID del proceso o intenta nuevamente.
                    </Text>
                  </Box>
                ) : manualDetails.length === 0 ? (
                  <EmptyDataScreen title="No hay manuales cargados" message="Agrega novedades manuales por empleado y período para verlas aquí." />
                ) : (
                  <Table.ScrollArea>
                    <Table.Root size="sm" stickyHeader>
                      <Table.Header>
                        <Table.Row bg="bg.subtle">
                          <Table.ColumnHeader>ID Detalle</Table.ColumnHeader>
                          <Table.ColumnHeader>ID Empleado</Table.ColumnHeader>
                          <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                          <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                          <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="end">Monto</Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="end">Acciones</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {manualDetails.map((manualDetail) => (
                          <Table.Row key={manualDetail.id}>
                            <Table.Cell>{manualDetail.id}</Table.Cell>
                            <Table.Cell>{manualDetail.employeeId}</Table.Cell>
                            <Table.Cell>{manualDetail.employeeFullName}</Table.Cell>
                            <Table.Cell>{manualDetail.conceptName}</Table.Cell>
                            <Table.Cell>{manualDetail.payrollTypeName}</Table.Cell>
                            <Table.Cell textAlign="end">{manualDetail.amount}</Table.Cell>
                            <Table.Cell textAlign="end">
                              <HStack justifyContent="flex-end" gap={2}>
                                <IconButton
                                  aria-label="Editar manual"
                                  size="sm"
                                  variant="outline"
                                  disabled={manualFormDisabled}
                                  onClick={() => {
                                    setSelectedManualDetail(manualDetail);
                                    manualDetailForm.reset({
                                      employeeId: manualDetail.employeeId,
                                      payrollUpdateId: manualDetail.payrollUpdateId ?? 0,
                                      amount: String(manualDetail.amount),
                                    });
                                  }}
                                >
                                  <LuPencil />
                                </IconButton>

                                <ConfirmActionDialog
                                  title="Eliminar detalle manual"
                                  description={`Vas a eliminar el detalle ${manualDetail.id}. Esta acción no se puede deshacer.`}
                                  acceptText="Eliminar"
                                  cancelText="Cancelar"
                                  trigger={
                                    <IconButton aria-label="Eliminar manual" size="sm" variant="outline" colorPalette="red" disabled={manualFormDisabled}>
                                      <LuTrash2 />
                                    </IconButton>
                                  }
                                  onAccept={() => handleDeleteManualDetail(manualDetail)}
                                />
                              </HStack>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Table.ScrollArea>
                )}
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {showPlanillasSection && (
        <Card.Root variant="outline">
          <Card.Body>
            <Stack gap={4}>
              <HStack justifyContent="space-between" flexWrap="wrap" gap={3}>
                <Stack gap={1}>
                  <Heading size="md">Cálculo masivo</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Ejecuta el cálculo del proceso seleccionado y revisa el resumen resultante.
                  </Text>
                </Stack>
                        <HStack gap={3} alignItems="center">
                          <Text color="gray.600">
                            {`Al calcular esta planilla, se absorberán automáticamente ${pendingManualsQuery.data?.length ?? 0} conceptos manuales pendientes de aplicación.`}
                          </Text>
                          <Button colorPalette="brand" onClick={handleCalculateProcess} disabled={!selectedProcessId || !processOpen || calculatePayrollProcess.isPending}>
                  {calculatePayrollProcess.isPending ? <Spinner size="sm" /> : <LuCalculator />}
                  Calcular proceso
                          </Button>
                        </HStack>
              </HStack>

              <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
                {renderCalculationSummary()}
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Stack>
  );
}