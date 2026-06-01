import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Text, Button, Heading, HStack, Stack, Grid, SimpleGrid } from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuFilter, LuScale, LuPrinter } from "react-icons/lu";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { useBalanceSumasSaldos } from "@/queries/accounting.queries";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableTree, { type TreeTableRow } from "@/components/ui/table-tree";

export default function BalanceSumasSaldosPage() {
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
  const { data: reportData, isLoading: isReportLoading, isError, error, refetch } = useBalanceSumasSaldos({
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
      document.title = `Sumas y Saldos - ${selectedProcessName}`;
    } else {
      document.title = "Balance de Sumas y Saldos";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [selectedProcessName]);

  // Transform data items to TableTree compatible rows
  const treeRows = useMemo<TreeTableRow[]>(() => {
    if (!reportData?.items) return [];

    const getParentCode = (code: string): string | null => {
      if (!code.includes(".")) return null;
      const parts = code.split(".");
      return parts.slice(0, parts.length - 1).join(".");
    };

    return reportData.items.map((item) => {
      const parentCode = getParentCode(item.accountCode);
      const depth = item.accountCode.split(".").length - 1;

      return {
        id: `sumas_${item.accountCode}`,
        code: item.accountCode,
        name: item.accountName,
        isGroup: !item.isAcceptor,
        depth: depth,
        parentId: parentCode ? `sumas_${parentCode}` : null,
        notes: item.isAcceptor ? "De Registro" : "De Grupo",
        values: [
          item.debitSum,
          item.creditSum,
          item.debitBalance,
          item.creditBalance,
        ],
      };
    });
  }, [reportData]);

  // Value column formatting renderers matching project styles
  const valueRenderers = useMemo(() => [
    // Suma Debe
    (val: number | null | undefined, row: TreeTableRow) => {
      if (val === null || val === undefined) return "";
      const isHeader = row.depth === 0;
      return (
        <Text color="teal.600" fontWeight={isHeader ? "bold" : "semibold"}>
          {parsePrice(val)}
        </Text>
      );
    },
    // Suma Haber
    (val: number | null | undefined, row: TreeTableRow) => {
      if (val === null || val === undefined) return "";
      const isHeader = row.depth === 0;
      return (
        <Text color="red.600" fontWeight={isHeader ? "bold" : "semibold"}>
          {parsePrice(val)}
        </Text>
      );
    },
    // Saldo Deudor
    (val: number | null | undefined, row: TreeTableRow) => {
      if (val === null || val === undefined) return "";
      const isHeader = row.depth === 0;
      return (
        <Text color="teal.800" fontWeight="bold">
          {parsePrice(val)}
        </Text>
      );
    },
    // Saldo Acreedor
    (val: number | null | undefined, row: TreeTableRow) => {
      if (val === null || val === undefined) return "";
      const isHeader = row.depth === 0;
      return (
        <Text color="red.800" fontWeight="bold">
          {parsePrice(val)}
        </Text>
      );
    }
  ], []);

  const handlePrint = () => {
    window.print();
  };

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
              onClick={() => navigate("/dash/contabilidad")}
              p={0}
              _hover={{ bg: "transparent", color: "brand.primary" }}
            >
              <LuArrowLeft /> Volver al Panel
            </Button>
            <Heading size="xl" fontWeight="bold">
              Balance de Sumas y Saldos
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
            <LuPrinter /> Imprimir Reporte
          </Button>
        </Flex>

        {/* Print Header */}
        <Box display="none" borderBottomWidth="2px" borderColor="gray.850" pb={4} mb={4}>
          <Heading size="xl" textAlign="center" color="gray.800" fontWeight="bold">
            SISTEMA DE GESTION
          </Heading>
          <Heading size="md" textAlign="center" color="gray.600" mt={1}>
            BALANCE DE COMPROBACIÓN DE SUMAS Y SALDOS
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
          <LoadingScreen message="Generando Balance de Sumas y Saldos..." height="300px" />
        ) : isError ? (
          <ErrorScreen
            title="Error al cargar el reporte"
            errorMessage={error?.message || "Error inesperado del servidor"}
            retry={refetch}
          />
        ) : !reportData || !reportData.items || reportData.items.length === 0 ? (
          <EmptyDataScreen
            title="Sin Movimientos Contables"
            message="No se encontraron movimientos contables en el rango de fechas seleccionado para el Balance de Sumas y Saldos."
            icon={<LuScale size={40} />}
          />
        ) : (
          <Stack gap={6}>
            {/* Quick Metrics Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Suma Debe
                </Text>
                <Text fontSize="xl" fontWeight="extrabold" color="teal.650" mt={2}>
                  {parsePrice(reportData.totalDebitSum)}
                </Text>
              </Box>

              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Suma Haber
                </Text>
                <Text fontSize="xl" fontWeight="extrabold" color="red.650" mt={2}>
                  {parsePrice(reportData.totalCreditSum)}
                </Text>
              </Box>

              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Saldo Deudor
                </Text>
                <Text fontSize="xl" fontWeight="extrabold" color="teal.800" mt={2}>
                  {parsePrice(reportData.totalDebitBalance)}
                </Text>
              </Box>

              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Saldo Acreedor
                </Text>
                <Text fontSize="xl" fontWeight="extrabold" color="red.800" mt={2}>
                  {parsePrice(reportData.totalCreditBalance)}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Tree Table */}
            <TableTree
              codeHeader="Código"
              conceptHeader="Cuenta Contable"
              notesHeader="Tipo"
              valueHeaders={["Suma Debe", "Suma Haber", "Saldo Deudor", "Saldo Acreedor"]}
              data={treeRows}
              valueRenderers={valueRenderers}
              showToggleButtons={true}
              showDecimals={false}
              minheight="400px"
            />
          </Stack>
        )}
      </Stack>
    </>
  );
}
