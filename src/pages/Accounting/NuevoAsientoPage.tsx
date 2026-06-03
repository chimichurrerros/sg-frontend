import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Grid,
  Stack,
  Input,
  IconButton,
  Field,
  Badge,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuPlus,
  LuTrash2,
  LuSave,
  LuLock,
} from "react-icons/lu";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { useAllAccountPlans } from "@/queries/accountPlans.queries";
import { useCreateEntry } from "@/queries/entries.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toaster } from "@/components/ui/toaster";

interface RowDetail {
  accountPlanId: number;
  debit: number;
  credit: number;
}

export default function NuevoAsientoPage() {
  const navigate = useNavigate();

  // Queries & Mutations
  const {
    data: processData,
    isLoading: isProcessLoading,
    isError: isProcessError,
    error: processError,
  } = useAllAccountantProcesses();
  
  const {
    data: planData,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useAllAccountPlans();

  const createEntryMutation = useCreateEntry();

  // Header state
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  // Details state
  const [details, setDetails] = useState<RowDetail[]>([
    { accountPlanId: 0, debit: 0, credit: 0 },
    { accountPlanId: 0, debit: 0, credit: 0 },
  ]);

  // Set default active process
  const activeProcess = useMemo(() => {
    if (!processData?.accountantProcesses || processData.accountantProcesses.length === 0) return null;
    if (selectedProcessId) {
      return processData.accountantProcesses.find((p) => p.id === selectedProcessId) || processData.accountantProcesses[0];
    }
    const openProcess = processData.accountantProcesses.find((p) => !p.isClosed);
    return openProcess || processData.accountantProcesses[0];
  }, [processData, selectedProcessId]);

  React.useEffect(() => {
    if (activeProcess && !selectedProcessId) {
      setSelectedProcessId(activeProcess.id);
    }
  }, [activeProcess, selectedProcessId]);

  // Filter accounts for select choices (must belong to selected process AND be imputable/acceptor)
  const availableAccounts = useMemo(() => {
    if (!planData?.accountPlans || !activeProcess) return [];
    return planData.accountPlans.filter(
      (ap) => ap.accountantProcessId === activeProcess.id && ap.isAcceptor
    );
  }, [planData, activeProcess]);

  const accountOptions = useMemo(() => {
    return availableAccounts.map((a) => ({
      label: `${a.code} - ${a.name}`,
      value: String(a.id),
    }));
  }, [availableAccounts]);

  const processOptions = useMemo(() => {
    return processData?.accountantProcesses.map((p) => ({
      label: `${p.name} ${p.isClosed ? "(Cerrado)" : "(Abierto)"}`,
      value: String(p.id),
    })) || [];
  }, [processData]);

  // Totals calculations
  const totalDebit = useMemo(() => {
    return details.reduce((sum, row) => sum + (row.debit || 0), 0);
  }, [details]);

  const totalCredit = useMemo(() => {
    return details.reduce((sum, row) => sum + (row.credit || 0), 0);
  }, [details]);

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  // Add a new row to entry details
  const handleAddRow = () => {
    setDetails([...details, { accountPlanId: 0, debit: 0, credit: 0 }]);
  };

  // Remove a row from entry details
  const handleRemoveRow = (index: number) => {
    if (details.length <= 2) {
      toaster.create({ title: "Un asiento contable debe tener al menos 2 filas", type: "error" });
      return;
    }
    const newDetails = [...details];
    newDetails.splice(index, 1);
    setDetails(newDetails);
  };

  // Update field value on detail row
  const handleRowChange = (index: number, field: keyof RowDetail, value: number) => {
    const newDetails = [...details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };
    
    // Clear opposite numeric value if writing to debit/credit to avoid same line debit & credit (standard bookkeeping)
    if (field === "debit" && value > 0) {
      newDetails[index].credit = 0;
    } else if (field === "credit" && value > 0) {
      newDetails[index].debit = 0;
    }

    setDetails(newDetails);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeProcess) {
      toaster.create({ title: "Seleccione un período contable válido", type: "error" });
      return;
    }
    if (activeProcess.isClosed) {
      toaster.create({ title: "El período contable seleccionado está cerrado", type: "error" });
      return;
    }
    if (!description.trim()) {
      toaster.create({ title: "Debe ingresar una descripción", type: "error" });
      return;
    }
    
    // Validate rows
    const validDetails = details.filter((d) => d.accountPlanId > 0 && (d.debit > 0 || d.credit > 0));
    if (validDetails.length < 2) {
      toaster.create({ title: "Debe ingresar al menos 2 líneas con cuentas y montos válidos", type: "error" });
      return;
    }
    if (totalDebit !== totalCredit) {
      toaster.create({ title: "Partida doble inválida: El Debe debe ser igual al Haber", type: "error" });
      return;
    }

    try {
      await createEntryMutation.mutateAsync({
        date: new Date(date).toISOString(),
        description: description.trim(),
        module: 4, // Manual module indicator or similar
        accountantProcessId: activeProcess.id,
        entryDetails: validDetails.map((d) => ({
          accountPlanId: d.accountPlanId,
          debit: d.debit,
          credit: d.credit,
        })),
      });

      toaster.create({ title: "Asiento manual creado con éxito", type: "success" });
      navigate(`/dash/contabilidad/libro-diario?process=${activeProcess.name}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.ErrorMessage || err.message;
      toaster.create({ title: "Error al registrar asiento", description: errorMsg, type: "error" });
    }
  };

  if (isProcessLoading || isPlanLoading) {
    return <LoadingScreen message="Cargando catálogos contables..." height="full" />;
  }

  if (isProcessError || isPlanError) {
    const errorDetails = processError?.message || planError?.message || "Error al conectar con la base de datos";
    return (
      <ErrorScreen
        title="Error de Carga"
        errorMessage={errorDetails}
        retry={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <Stack gap={6} paddingInline="10%" py={4}>
      {/* Title block */}
      <Flex justify="space-between" align="center">
        <Stack gap={1}>
          <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
            onClick={() => navigate("/dash/contabilidad")}
            p={0}
            _hover={{ bg: "transparent", color: "brand.primary" }}
          >
            <LuArrowLeft /> Volver al Panel
          </Button>
          <Heading size="xl" fontWeight="bold">
            Nuevo Asiento Manual
          </Heading>
        </Stack>
      </Flex>

      {activeProcess?.isClosed && (
        <Flex align="center" gap={3} p={4} bg="red.50" border="1px solid" borderColor="red.150" borderRadius="xl" color="red.700">
          <LuLock size={20} />
          <Box>
            <Text fontWeight="bold" fontSize="sm">Período Cerrado</Text>
            <Text fontSize="xs">El período contable seleccionado está cerrado y no admite asientos manuales.</Text>
          </Box>
        </Flex>
      )}

      {/* Main Entry Form */}
      <Box as="form" onSubmit={handleSubmit} bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={6}>
          {/* Period selector */}
          <Field.Root required>
            <Field.Label fontWeight="semibold" fontSize="xs">Periodo Contable</Field.Label>
            <SelectWrapper
              options={processOptions}
              value={String(selectedProcessId)}
              onValueChange={(val) => {
                setSelectedProcessId(Number(val));
                // reset rows as plan changes
                setDetails([
                  { accountPlanId: 0, debit: 0, credit: 0 },
                  { accountPlanId: 0, debit: 0, credit: 0 },
                ]);
              }}
              width="100%"
            />
          </Field.Root>

          {/* Entry Date */}
          <Field.Root required>
            <Field.Label fontWeight="semibold" fontSize="xs">Fecha del Asiento</Field.Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={activeProcess?.isClosed || createEntryMutation.isPending}
            />
          </Field.Root>

          {/* Description */}

        </Grid>

        {/* Ledger Details List */}
        <Box border="1px solid" borderColor="gray.150" borderRadius="lg" overflow="hidden" mb={6}>
          <Box p={3} bg="gray.50" borderBottom="1px solid" borderColor="gray.150" display="grid" gridTemplateColumns="4fr 2fr 2fr 48px" gap={4} fontWeight="bold" fontSize="xs" color="gray.600">
            <Text>Cuenta Contable</Text>
            <Text textAlign="right">Debe</Text>
            <Text textAlign="right">Haber</Text>
            <Text></Text>
          </Box>

          <Stack gap={0} py={2} bg="white">
            {details.map((row, index) => (
              <Box
                key={index}
                p={2}
                px={3}
                display="grid"
                gridTemplateColumns="4fr 2fr 2fr 48px"
                gap={4}
                alignItems="center"
                borderBottom={index < details.length - 1 ? "1px solid" : "none"}
                borderColor="gray.100"
              >
                {/* Account Plan Selector */}
                <SelectWrapper
                  options={accountOptions}
                  value={row.accountPlanId > 0 ? String(row.accountPlanId) : ""}
                  onValueChange={(val) => handleRowChange(index, "accountPlanId", Number(val))}
                  placeholder="Seleccionar cuenta..."
                  width="100%"
                  disabled={activeProcess?.isClosed || createEntryMutation.isPending}
                />

                {/* Debit Currency Input */}
                <CurrencyInput
                  value={row.debit}
                  onValueChange={(v) => handleRowChange(index, "debit", isNaN(v) ? 0 : v)}
                  disabled={activeProcess?.isClosed || createEntryMutation.isPending || row.credit > 0}
                  min={0}
                />

                {/* Credit Currency Input */}
                <CurrencyInput
                  value={row.credit}
                  onValueChange={(v) => handleRowChange(index, "credit", isNaN(v) ? 0 : v)}
                  disabled={activeProcess?.isClosed || createEntryMutation.isPending || row.debit > 0}
                  min={0}
                />

                {/* Remove button */}
                <IconButton
                  variant="ghost"
                  colorPalette="red"
                  size="xs"
                  onClick={() => handleRemoveRow(index)}
                  disabled={activeProcess?.isClosed || createEntryMutation.isPending}
                >
                  <LuTrash2 />
                </IconButton>
              </Box>
            ))}
          </Stack>

          {/* Sum Summary footer row */}
          <Box p={3} bg="gray.50" borderTop="1px solid" borderColor="gray.150" display="grid" gridTemplateColumns="4fr 2fr 2fr 48px" gap={4} fontWeight="extrabold" fontSize="sm" color="gray.800">
            <Text textAlign="right">Totales:</Text>
            <Text textAlign="right" color="teal.700">
              {new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG" }).format(totalDebit)}
            </Text>
            <Text textAlign="right" color="red.700">
              {new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG" }).format(totalCredit)}
            </Text>
            <Text></Text>
          </Box>
        </Box>

        {/* Balancing Verification Status */}
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
          <Button
            size="sm"
            variant="outline"
            color="brand.primary"
            borderColor="brand.primary"
            onClick={handleAddRow}
            disabled={activeProcess?.isClosed || createEntryMutation.isPending}
            gap={2}
          >
            <LuPlus /> Agregar Línea
          </Button>

          {totalDebit > 0 || totalCredit > 0 ? (
            isBalanced ? (
              <Badge colorPalette="green" variant="solid" p={2} px={3} borderRadius="full">
                Balanceado: Debe y Haber coinciden
              </Badge>
            ) : (
              <Badge colorPalette="red" variant="solid" p={2} px={3} borderRadius="full">
                Desbalanceado: Diferencia de {new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG" }).format(Math.abs(totalDebit - totalCredit))}
              </Badge>
            )
          ) : null}
        </Flex>

        {/* Submit & Cancel Buttons */}
        <Flex justify="flex-end" gap={4}>
          <Button
            variant="outline"
            onClick={() => navigate("/dash/contabilidad")}
            disabled={createEntryMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            bgColor="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary" }}
            loading={createEntryMutation.isPending}
            disabled={activeProcess?.isClosed || !isBalanced}
            gap={2}
          >
            <LuSave /> Guardar Asiento
          </Button>
        </Flex>
      </Box>
    </Stack>
  );
}
