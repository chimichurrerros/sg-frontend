import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Text, Button, Heading, HStack, Stack, Grid } from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuCalendar, LuFilter, LuBookOpen, LuScale } from "react-icons/lu";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { useLibroDiario } from "@/queries/accounting.queries";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableTree, { type TreeTableRow } from "@/components/ui/table-tree";

export default function LibroDiarioPage() {
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

  const { data: reportData, isLoading: isReportLoading, isError, error, refetch } = useLibroDiario({
    accountantProcessId: activeProcess?.id || 0,
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
      document.title = `Libro Diario - ${selectedProcessName}`;
    } else {
      document.title = "Libro Diario";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [selectedProcessName]);

  // Grand totals calculations
  const grandTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    if (reportData?.entries) {
      for (const entry of reportData.entries) {
        for (const detail of entry.details) {
          totalDebit += detail.debit || 0;
          totalCredit += detail.credit || 0;
        }
      }
    }
    return { totalDebit, totalCredit };
  }, [reportData]);

  const treeRows = useMemo<TreeTableRow[]>(() => {
    if (!reportData?.entries) return [];
    const rows: TreeTableRow[] = [];

    for (const entry of reportData.entries) {
      const entryIdStr = `entry_${entry.entryId}`;

      // Parent row: the Asiento entry metadata
      // Code is `#${entry.entryId}`, Name is the description, Notes (Código) is empty.
      // We pass `[null, null]` as values so parent row does not duplicate Debe/Haber amounts.
      rows.push({
        id: entryIdStr,
        code: `#${entry.entryId}`,
        name: `${parseDate(entry.date)} - ${entry.description} [${entry.moduleName}]`,
        isGroup: true,
        depth: 0,
        parentId: null,
        notes: "",
        values: [null, null],
      });

      // Child rows: the details of accounts debited and credited
      // Code is `"↳"`, Name is the account name, Notes is the account code.
      entry.details.forEach((detail, idx) => {
        rows.push({
          id: `detail_${entry.entryId}_${idx}`,
          code: "↳",
          name: detail.credit > 0 ? `a ${detail.accountName}` : detail.accountName,
          isGroup: false,
          depth: 1,
          parentId: entryIdStr,
          notes: detail.accountCode,
          values: [detail.debit || null, detail.credit || null],
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
            onClick={() => navigate("/dash/contabilidad")}
            p={0}
            _hover={{ bg: "transparent", color: "brand.primary" }}
          >
            <LuArrowLeft /> Volver al Panel
          </Button>
          <Heading size="xl" fontWeight="bold">
            Libro Diario
          </Heading>
        </Stack>
        <Button
          size="md"
          variant="outline"
          borderColor="brand.primary"
          color="brand.primary"
          _hover={{ bg: "brand.primary", color: "white" }}
          onClick={() =>
            navigate(
              `/dash/contabilidad/balance-sumas-saldos?process=${selectedProcessName}&startDate=${startDate}&endDate=${endDate}`
            )
          }
          display="flex"
          alignItems="center"
          gap={2}
        >
          <LuScale /> Ver Sumas y Saldos
        </Button>
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
        <LoadingScreen message="Cargando Libro Diario..." height="300px" />
      ) : isError ? (
        <ErrorScreen
          title="Error al cargar el reporte"
          errorMessage={error?.message || "Error inesperado del servidor"}
          retry={refetch}
        />
      ) : !reportData?.entries || reportData.entries.length === 0 ? (
        <EmptyDataScreen
          title="Sin Asientos Registrados"
          message="No se encontraron transacciones en el Libro Diario para el período de fechas seleccionado."
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

          {/* Collapsible Tree Table for General Journal */}
          <TableTree
            codeHeader="Asiento"
            conceptHeader="Fecha - Descripción [Módulo] / Cuenta Contable"
            notesHeader="Código" // Notes column maps to accountCode
            valueHeaders={["Debe (Debit)", "Haber (Credit)"]}
            data={treeRows}
            valueRenderers={valueRenderers}
            minheight="400px"
            showDecimals={false} // Guaraní amounts are usually shown without decimals
          />
        </Stack>
      )}
    </Stack>
  );
}
