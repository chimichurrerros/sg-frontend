import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Text, Button, Heading, HStack, Stack, Grid } from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuCalendar, LuFilter, LuBookOpen } from "react-icons/lu";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { useLibroMayor } from "@/queries/accounting.queries";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableTree, { type TreeTableRow } from "@/components/ui/tables/table-tree";

export default function LibroMayorPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: processData, isLoading: isProcessLoading } = useAllAccountantProcesses();

  const [selectedProcessName, setSelectedProcessName] = useState(() => searchParams.get("process") || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activeProcess = useMemo(() => {
    if (!processData?.accountantProcesses) return null;
    return processData.accountantProcesses.find((p) => p.name === selectedProcessName) || processData.accountantProcesses[0];
  }, [processData, selectedProcessName]);

  useEffect(() => {
    if (activeProcess) {
      if (!selectedProcessName) {
        setSelectedProcessName(activeProcess.name);
      }
      if (!startDate) {
        setStartDate(activeProcess.startDate);
      }
      if (!endDate) {
        setEndDate(activeProcess.endDate);
      }
    }
  }, [activeProcess, startDate, endDate, selectedProcessName]);

  const handleProcessChange = (processName: string) => {
    setSelectedProcessName(processName);
    const targetProcess = processData?.accountantProcesses.find((p) => p.name === processName);
    if (targetProcess) {
      setStartDate(targetProcess.startDate);
      setEndDate(targetProcess.endDate);
      setSearchParams({ process: processName });
    }
  };

  const { data: reportData, isLoading: isReportLoading, isError, error, refetch } = useLibroMayor({
    accountantProcessId: activeProcess?.id || 0,
    accountPlanId: 1, // Defaulting to 1 as per system setup
    startDate,
    endDate,
  }, !!activeProcess?.id && !!startDate && !!endDate);

  const periodOptions = useMemo(() => {
    return processData?.accountantProcesses.map((p) => ({
      label: p.name,
      value: p.name,
    })) || [];
  }, [processData]);

  // Document/Tab title synchronization
  useEffect(() => {
    const originalTitle = document.title;
    if (selectedProcessName) {
      document.title = `Libro Mayor - ${selectedProcessName}`;
    } else {
      document.title = "Libro Mayor";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [selectedProcessName]);

  // Grand totals calculations (Sum of all accounts totalDebit and totalCredit)
  const grandTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    if (reportData?.accounts) {
      for (const account of reportData.accounts) {
        totalDebit += account.totalDebit || 0;
        totalCredit += account.totalCredit || 0;
      }
    }
    return { totalDebit, totalCredit };
  }, [reportData]);

  // Map accounts and their movements into a hierarchical Tree structure
  const treeRows = useMemo<TreeTableRow[]>(() => {
    if (!reportData?.accounts) return [];
    const rows: TreeTableRow[] = [];

    for (const account of reportData.accounts) {
      const accountIdStr = `account_${account.accountId}`;

      // Parent row: the Account code, name and overall balances
      rows.push({
        id: accountIdStr,
        code: account.accountCode,
        name: account.accountName,
        isGroup: true,
        depth: 0,
        parentId: null,
        notes: `Saldo Inicial: ${parsePrice(account.initialBalance)} | Saldo Final: ${parsePrice(account.finalBalance)}`,
        values: [account.totalDebit || null, account.totalCredit || null],
      });

      // Child rows: the movements of the account
      account.movements.forEach((movement, idx) => {
        rows.push({
          id: `movement_${account.accountId}_${movement.entryId}_${idx}`,
          code: parseDate(movement.date),
          name: movement.description,
          isGroup: false,
          depth: 1,
          parentId: accountIdStr,
          notes: `Saldo Acum.: ${parsePrice(movement.runningBalance)}`,
          values: [movement.debit || null, movement.credit || null],
        });
      });
    }

    return rows;
  }, [reportData]);

  // Color-coded renderers for Debe (teal) and Haber (red)
  const valueRenderers = useMemo(() => [
    // Debe (Debit) Renderer
    (val: number | null | undefined) => {
      if (val === null || val === undefined) return "";
      return (
        <Text color="teal.600" fontWeight="bold">
          {parsePrice(val)}
        </Text>
      );
    },
    // Haber (Credit) Renderer
    (val: number | null | undefined) => {
      if (val === null || val === undefined) return "";
      return (
        <Text color="red.600" fontWeight="bold">
          {parsePrice(val)}
        </Text>
      );
    }
  ], []);

  if (isProcessLoading) {
    return <LoadingScreen message="Cargando procesos contables..." height="full" />;
  }

  return (
    <Stack gap={6} paddingInline="5%" py={4}>
      {/* Back to Dashboard Button & Heading */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Stack gap={1}>
          <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
            onClick={() => navigate("/contabilidad")}
            p={0}
            _hover={{ bg: "transparent", color: "brand.primary" }}
          >
            <LuArrowLeft /> Volver al Panel
          </Button>
          <Heading size="xl" fontWeight="bold">
            Libro Mayor
          </Heading>
        </Stack>
      </Flex>

      {/* Filters Box */}
      <Box 
        borderWidth="1px" 
        borderColor="gray.200" 
        borderRadius="xl" 
        p={5} 
        bg="white" 
        shadow="xs"
      >
        <Text mb={3} fontSize="md" fontWeight="bold" color="gray.700" display="flex" alignItems="center" gap={2}>
          <LuFilter /> Filtros de Reporte
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} alignItems="end">
          {/* Process Selector */}
          <Stack gap={1.5}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500">
              Proceso Contable
            </Text>
            <SelectWrapper
              options={periodOptions}
              value={selectedProcessName}
              onValueChange={handleProcessChange}
              width="100%"
            />
          </Stack>

          {/* Start Date */}
          <Stack gap={1.5}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500">
              Fecha Desde
            </Text>
            <DatePickerWrapper
              value={startDate}
              width="100%"
              onChange={(dates) => dates[0] && setStartDate(dates[0])}
            />
          </Stack>

          {/* End Date */}
          <Stack gap={1.5}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500">
              Fecha Hasta
            </Text>
            <DatePickerWrapper
              value={endDate}
              width="100%"
              onChange={(dates) => dates[0] && setEndDate(dates[0])}
            />
          </Stack>
        </Grid>
      </Box>

      {/* Main Content Area */}
      {isReportLoading ? (
        <LoadingScreen message="Cargando Libro Mayor..." height="300px" />
      ) : isError ? (
        <ErrorScreen
          title="Error al cargar el reporte"
          errorMessage={error?.message || "Error inesperado del servidor"}
          retry={refetch}
        />
      ) : !reportData?.accounts || reportData.accounts.length === 0 ? (
        <EmptyDataScreen
          title="Sin Cuentas Registradas"
          message="No se encontraron movimientos en el Libro Mayor para el período de fechas seleccionado."
          icon={<LuBookOpen size={40} />}
        />
      ) : (
        <Stack gap={6}>
          {/* Total Summary Banner with Balance Status Badge */}
          <Flex 
            justify="space-between" 
            align="center" 
            p={5} 
            bg="brand.primary" 
            color="white" 
            borderRadius="xl"
            shadow="sm"
            wrap="wrap"
            gap={4}
          >
            <Stack gap={2}>
              <Text fontWeight="bold" fontSize="md">
                Resumen del Período Seleccionado
              </Text>
              {grandTotals.totalDebit === grandTotals.totalCredit ? (
                <Flex align="center" gap={1.5} bg="white/20" px={3} py={1} borderRadius="full" alignSelf="start">
                  <Box w="8px" h="8px" bg="green.300" borderRadius="full" />
                  <Text fontSize="xs" fontWeight="bold">Balanceado</Text>
                </Flex>
              ) : (
                <Flex align="center" gap={1.5} bg="white/20" px={3} py={1} borderRadius="full" alignSelf="start">
                  <Box w="8px" h="8px" bg="red.300" borderRadius="full" />
                  <Text fontSize="xs" fontWeight="bold">
                    Desbalanceado (Diferencia: {parsePrice(Math.abs(grandTotals.totalDebit - grandTotals.totalCredit))})
                  </Text>
                </Flex>
              )}
            </Stack>
            <HStack gap={8}>
              <Box textAlign="right">
                <Text fontSize="xs" opacity={0.9} fontWeight="semibold">TOTAL DEBE</Text>
                <Text fontSize="lg" fontWeight="extrabold">{parsePrice(grandTotals.totalDebit)}</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="xs" opacity={0.9} fontWeight="semibold">TOTAL HABER</Text>
                <Text fontSize="lg" fontWeight="extrabold">{parsePrice(grandTotals.totalCredit)}</Text>
              </Box>
            </HStack>
          </Flex>

          {/* Collapsible Tree Table for General Ledger */}
          <TableTree
            codeHeader="Código / Fecha"
            conceptHeader="Cuenta / Descripción del Movimiento"
            notesHeader="Saldos / Detalle"
            valueHeaders={["Debe (Debit)", "Haber (Credit)"]}
            data={treeRows}
            valueRenderers={valueRenderers}
            minheight="400px"
            showDecimals={false} // Guaraní amounts are shown without decimals
          />
        </Stack>
      )}
    </Stack>
  );
}
