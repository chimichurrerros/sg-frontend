import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Text, Button, Heading, HStack, Stack, Grid, SimpleGrid, Badge } from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuFilter, LuTrendingUp, LuPrinter } from "react-icons/lu";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { useBalanceResultados } from "@/queries/accounting.queries";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableTree, { type TreeTableRow } from "@/components/ui/tables/table-tree";
import type { BalanceGeneralItem } from "@/types/accounting";

export default function BalanceResultadosPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load accounting processes
  const { data: processData, isLoading: isProcessLoading } = useAllAccountantProcesses();

  const [selectedProcessName, setSelectedProcessName] = useState(() => searchParams.get("process") || "");
  const [startDate, setStartDate] = useState(() => searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(() => searchParams.get("endDate") || "");

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
  }, [activeProcess, selectedProcessName, startDate, endDate]);

  const handleProcessChange = (processName: string) => {
    setSelectedProcessName(processName);
    const targetProcess = processData?.accountantProcesses.find((p) => p.name === processName);
    if (targetProcess) {
      setStartDate(targetProcess.startDate);
      setEndDate(targetProcess.endDate);
      setSearchParams({
        process: processName,
        startDate: targetProcess.startDate,
        endDate: targetProcess.endDate,
      });
    }
  };

  const handleDateChange = (type: "start" | "end", dateStr: string) => {
    if (type === "start") {
      setStartDate(dateStr);
      setSearchParams({
        process: selectedProcessName,
        startDate: dateStr,
        endDate: endDate,
      });
    } else {
      setEndDate(dateStr);
      setSearchParams({
        process: selectedProcessName,
        startDate: startDate,
        endDate: dateStr,
      });
    }
  };

  // Fetch report data from backend
  const { data: reportData, isLoading: isReportLoading, isError, error, refetch } = useBalanceResultados({
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

  // Sync browser window title
  useEffect(() => {
    const originalTitle = document.title;
    if (selectedProcessName) {
      document.title = `Balance de Resultados - ${selectedProcessName}`;
    } else {
      document.title = "Balance de Resultados";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [selectedProcessName]);

  // Tree data structure builders
  const trees = useMemo(() => {
    const buildTreeRows = (items: BalanceGeneralItem[] | null | undefined, prefix: string) => {
      if (!items || items.length === 0) return [];

      const getParentCode = (code: string): string | null => {
        if (!code.includes(".")) return null;
        const parts = code.split(".");
        return parts.slice(0, parts.length - 1).join(".");
      };

      return items.map((item) => {
        const parentCode = getParentCode(item.accountCode);
        const depth = item.accountCode.split(".").length - 1;

        return {
          id: `${prefix}_${item.accountCode}`,
          code: item.accountCode,
          name: item.accountName,
          isGroup: !item.isAcceptor,
          depth: depth,
          parentId: parentCode ? `${prefix}_${parentCode}` : null,
          notes: item.isAcceptor ? "De Registro" : "De Grupo",
          values: [item.balance || 0],
        };
      });
    };

    const revenueRows = buildTreeRows(reportData?.revenues, "rev");
    const expenseRows = buildTreeRows(reportData?.expenses, "exp");

    return {
      revenueRows,
      expenseRows,
    };
  }, [reportData]);

  // Color renderers for amounts
  const valueRenderers = useMemo(() => [
    (val: number | null | undefined, row: TreeTableRow) => {
      if (val === null || val === undefined) return "";
      const isNegative = val < 0;
      const parsed = parsePrice(val);
      const isHeader = row.depth === 0;

      return (
        <Text color={isNegative ? "red.650" : isHeader ? "gray.900" : "gray.750"} fontWeight={isHeader ? "bold" : "semibold"}>
          {parsed}
        </Text>
      );
    },
  ], []);

  const handlePrint = () => {
    window.print();
  };

  const isProfit = (reportData?.netIncome || 0) >= 0;
  const netIncomeText = isProfit ? "Utilidad Neta" : "Pérdida Neta";
  const netIncomeColor = isProfit ? "green.600" : "red.650";
  const netIncomeBg = isProfit ? "green.50/50" : "red.50/50";
  const netIncomeBorder = isProfit ? "green.200" : "red.200";

  if (isProcessLoading) {
    return <LoadingScreen message="Cargando procesos contables..." height="full" />;
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-grid {
            display: block !important;
          }
          .print-col {
            margin-bottom: 30px !important;
            width: 100% !important;
          }
        }
      `}</style>

      <Stack gap={6} paddingInline="5%" py={4} id="print-area">
        {/* Header Toolbar */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} className="no-print">
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
              Balance de Resultados
            </Heading>
          </Stack>
          <Button
            size="md"
            variant="outline"
            borderColor="brand.primary"
            color="brand.primary"
            _hover={{ bg: "brand.primary", color: "white" }}
            onClick={handlePrint}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <LuPrinter /> Imprimir Balance
          </Button>
        </Flex>

        {/* Print Header */}
        <Box display="none" borderBottomWidth="2px" borderColor="gray.850" pb={4} mb={4}>
          <Heading size="xl" textAlign="center" color="gray.800" fontWeight="bold">
            SISTEMA DE GESTION
          </Heading>
          <Heading size="md" textAlign="center" color="gray.600" mt={1}>
            ESTADO DE RENTABILIDAD (BALANCE DE RESULTADOS)
          </Heading>
          <Text textAlign="center" fontSize="sm" color="gray.500" mt={1} fontWeight="semibold">
            Período: {selectedProcessName} | Rango: {parseDate(startDate)} al {parseDate(endDate)}
          </Text>
          <Text textAlign="center" fontSize="xs" color="gray.400" mt={0.5}>
            Expresado en Guaraníes (PYG)
          </Text>
        </Box>

        {/* Filters */}
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          p={5}
          bg="white"
          shadow="xs"
          className="no-print"
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
                onChange={(dates) => dates[0] && handleDateChange("start", dates[0])}
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
                onChange={(dates) => dates[0] && handleDateChange("end", dates[0])}
              />
            </Stack>
          </Grid>
        </Box>

        {/* Loading, Error and Empty states */}
        {isReportLoading ? (
          <LoadingScreen message="Generando Balance de Resultados..." height="300px" />
        ) : isError ? (
          <ErrorScreen
            title="Error al cargar el balance de resultados"
            errorMessage={error?.message || "Error inesperado del servidor"}
            retry={refetch}
          />
        ) : !reportData || (!reportData.revenues && !reportData.expenses) ? (
          <EmptyDataScreen
            title="Sin Movimientos Contables"
            message="No se encontraron movimientos de ingresos o egresos para generar el Balance de Resultados en el rango seleccionado."
            icon={<LuTrendingUp size={40} />}
          />
        ) : (
          <Stack gap={6}>
            {/* Quick Metrics & Net Income Banner */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Ingresos
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color="green.600" mt={2}>
                  {parsePrice(reportData.totalRevenues)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Ingresos operativos y ventas del período
                </Text>
              </Box>

              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Egresos
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color="red.650" mt={2}>
                  {parsePrice(reportData.totalExpenses)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Costos operativos, compras y salarios pagados
                </Text>
              </Box>

              <Box
                bg={netIncomeBg}
                borderColor={netIncomeBorder}
                borderWidth="1px"
                p={5}
                borderRadius="xl"
                shadow="xs"
              >
                <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
                  {netIncomeText}
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color={netIncomeColor} mt={2}>
                  {parsePrice(reportData.netIncome)}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Resultado neto del ejercicio contable
                </Text>
              </Box>
            </SimpleGrid>

            {/* Tree Tables Section */}
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} className="print-grid">
              {/* Left Column: Revenues */}
              <Stack gap={3} className="print-col">
                <Heading size="md" color="gray.700" pl={1} borderLeft="4px solid" borderColor="green.500" py={1} display="flex">
                  <Text>3. Ingresos</Text>
                  <Badge variant="subtle" colorPalette="green" size="md">
                    Total: {parsePrice(reportData.totalRevenues)}
                  </Badge>
                </Heading>
                <TableTree
                  codeHeader="Código"
                  conceptHeader="Cuenta de Ingresos"
                  notesHeader="Tipo"
                  valueHeaders={["Saldo"]}
                  data={trees.revenueRows}
                  valueRenderers={valueRenderers}
                  showToggleButtons={false}
                  showDecimals={false}
                  minheight="350px"
                />
              </Stack>

              {/* Right Column: Expenses */}
              <Stack gap={3} className="print-col">
                <Heading size="md" color="gray.700" pl={1} borderLeft="4px solid" borderColor="red.500" py={1} display="flex">
                  <Text>4. Egresos</Text>
                  <Badge variant="subtle" colorPalette="red" size="md">
                    Total: {parsePrice(reportData.totalExpenses)}
                  </Badge>
                </Heading>
                <TableTree
                  codeHeader="Código"
                  conceptHeader="Cuenta de Egresos"
                  notesHeader="Tipo"
                  valueHeaders={["Saldo"]}
                  data={trees.expenseRows}
                  valueRenderers={valueRenderers}
                  showToggleButtons={false}
                  showDecimals={false}
                  minheight="350px"
                />
              </Stack>
            </Grid>
          </Stack>
        )}
      </Stack>
    </>
  );
}
