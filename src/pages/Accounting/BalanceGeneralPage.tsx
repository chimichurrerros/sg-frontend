import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Text, Button, Heading, HStack, Stack, Grid, SimpleGrid, Badge } from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuFilter, LuScale, LuPrinter } from "react-icons/lu";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { useBalanceGeneral } from "@/queries/accounting.queries";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import TableTree, { type TreeTableRow } from "@/components/ui/table-tree";
import type { BalanceGeneralItem } from "@/types/accounting";

export default function BalanceGeneralPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load accounting processes
  const { data: processData, isLoading: isProcessLoading } = useAllAccountantProcesses();

  const [selectedProcessName, setSelectedProcessName] = useState(() => searchParams.get("process") || "");
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
      if (!endDate) {
        setEndDate(activeProcess.endDate);
      }
    }
  }, [activeProcess, endDate, selectedProcessName]);

  const handleProcessChange = (processName: string) => {
    setSelectedProcessName(processName);
    const targetProcess = processData?.accountantProcesses.find((p) => p.name === processName);
    if (targetProcess) {
      setEndDate(targetProcess.endDate);
      setSearchParams({ process: processName });
    }
  };

  // Convert simple date string YYYY-MM-DD to ISO string required by the backend
  const isoEndDate = useMemo(() => {
    if (!endDate) return "";
    return endDate.includes("T") ? endDate : `${endDate}T23:59:59.999Z`;
  }, [endDate]);

  // Fetch Balance General report from API
  const { data: reportData, isLoading: isReportLoading, isError, error, refetch } = useBalanceGeneral({
    accountantProcessId: activeProcess?.id || 0,
    endDate: isoEndDate,
  }, !!activeProcess?.id && !!isoEndDate);

  const periodOptions = useMemo(() => {
    return processData?.accountantProcesses.map((p) => ({
      label: p.name,
      value: p.name,
    })) || [];
  }, [processData]);

  // Sync document/tab title
  useEffect(() => {
    const originalTitle = document.title;
    if (selectedProcessName) {
      document.title = `Balance General - ${selectedProcessName}`;
    } else {
      document.title = "Balance General";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [selectedProcessName]);

  // Standard group names for Paraguayan chart of accounts
  const STANDARD_NAMES: Record<string, string> = {
    "1": "ACTIVO",
    "2": "PASIVO",
  };

  // Build tree data structures from backend arrays
  const trees = useMemo(() => {
    const buildTreeRows = (items: BalanceGeneralItem[] | null | undefined, rootCode: string) => {
      if (!items || items.length === 0) return [];

      // 1. Gather all unique codes and recursively add all hierarchical parent codes
      const allCodes = new Set<string>();
      items.forEach((item) => {
        allCodes.add(item.accountCode);
        const parts = item.accountCode.split(".");
        for (let i = 1; i < parts.length; i++) {
          allCodes.add(parts.slice(0, i).join("."));
        }
      });

      const isLeaf = (code: string, codesList: string[]) => {
        return !codesList.some((other) => other !== code && other.startsWith(code + "."));
      };

      // 2. Map codes to their names, balances and properties
      const itemsMap = new Map<string, { code: string; name: string; balance: number; isVirtual: boolean }>();
      items.forEach((item) => {
        itemsMap.set(item.accountCode, {
          code: item.accountCode,
          name: item.accountName,
          balance: item.balance || 0,
          isVirtual: false,
        });
      });

      // Inject standard group labels for nodes that are ancestors but missing in the dataset
      allCodes.forEach((code) => {
        if (!itemsMap.has(code)) {
          const standardName = STANDARD_NAMES[code] || `Grupo ${code}`;
          itemsMap.set(code, {
            code,
            name: standardName,
            balance: 0,
            isVirtual: true,
          });
        }
      });

      const codesArray = Array.from(allCodes);
      const leafCodes = codesArray.filter((code) => isLeaf(code, codesArray));

      // 3. Aggregate balances bottom-up for parent nodes
      const aggregatedBalances = new Map<string, number>();
      codesArray.forEach((code) => {
        let sum = 0;
        leafCodes.forEach((leafCode) => {
          if (leafCode === code || leafCode.startsWith(code + ".")) {
            const leafItem = itemsMap.get(leafCode);
            if (leafItem) {
              sum += leafItem.balance;
            }
          }
        });
        aggregatedBalances.set(code, sum);
      });

      // Sort segments numerically (natural sort e.g. 1.2 before 1.10)
      const compareCodes = (a: string, b: string) => {
        const partsA = a.split(".").map(Number);
        const partsB = b.split(".").map(Number);
        const minLen = Math.min(partsA.length, partsB.length);
        for (let i = 0; i < minLen; i++) {
          if (partsA[i] !== partsB[i]) {
            return partsA[i] - partsB[i];
          }
        }
        return partsA.length - partsB.length;
      };

      const sortedCodes = codesArray.sort(compareCodes);

      const getParentCode = (code: string): string | null => {
        if (!code.includes(".")) return null;
        const parts = code.split(".");
        return parts.slice(0, parts.length - 1).join(".");
      };

      return sortedCodes.map((code) => {
        const itemObj = itemsMap.get(code)!;
        const parentCode = getParentCode(code);
        const isGrp = !isLeaf(code, codesArray);
        const depth = code.split(".").length - 1;

        return {
          id: `bg_${code}`,
          code: code,
          name: itemObj.name,
          isGroup: isGrp,
          depth: depth,
          parentId: parentCode ? `bg_${parentCode}` : null,
          notes: isGrp ? "Cuenta de Grupo" : "Cuenta de Registro",
          values: [aggregatedBalances.get(code) || 0],
        };
      });
    };

    const activoRows = buildTreeRows(reportData?.assets, "1");
    const pasivoRows = buildTreeRows(reportData?.liabilities, "2");

    // Read totals directly calculated by the backend
    const totalAssets = reportData?.totalAssets || 0;
    const totalLiabilities = reportData?.totalLiabilities || 0;

    return {
      activoRows,
      pasivoRows,
      totals: {
        totalAssets,
        totalLiabilities,
      },
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
        <Text color={isNegative ? "red.600" : isHeader ? "gray.900" : "gray.700"} fontWeight={isHeader ? "bold" : "semibold"}>
          {parsed}
        </Text>
      );
    },
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
        {/* Header toolbar */}
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
              Balance General
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
            ESTADO DE SITUACION FINANCIERA (BALANCE GENERAL)
          </Heading>
          <Text textAlign="center" fontSize="sm" color="gray.500" mt={1} fontWeight="semibold">
            Proceso Contable: {selectedProcessName} | Fecha de Corte: {parseDate(endDate)}
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
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} alignItems="end">
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

            {/* End Date (Cut-off Date) */}
            <Stack gap={1.5}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                Fecha de Corte
              </Text>
              <DatePickerWrapper
                value={endDate}
                width="100%"
                onChange={(dates) => dates[0] && setEndDate(dates[0])}
              />
            </Stack>
          </Grid>
        </Box>

        {/* Loading, Error and Empty states */}
        {isReportLoading ? (
          <LoadingScreen message="Generando Balance General..." height="300px" />
        ) : isError ? (
          <ErrorScreen
            title="Error al cargar el balance"
            errorMessage={error?.message || "Error inesperado del servidor"}
            retry={refetch}
          />
        ) : !reportData || (!reportData.assets && !reportData.liabilities) ? (
          <EmptyDataScreen
            title="Sin Movimientos Contables"
            message="No se encontraron movimientos contables para generar el Balance General en la fecha seleccionada."
            icon={<LuScale size={40} />}
          />
        ) : (
          <Stack gap={6}>
            {/* Balance status banner
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
                  Resumen de Saldos
                </Text>
                <Text fontSize="xs" color="white/80">
                  Estado consolidado del período seleccionado
                </Text>
              </Stack>
              <HStack gap={8}>
                <Box textAlign="right">
                  <Text fontSize="xs" opacity={0.9} fontWeight="semibold">TOTAL ACTIVO</Text>
                  <Text fontSize="lg" fontWeight="extrabold">{parsePrice(trees.totals.totalAssets)}</Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="xs" opacity={0.9} fontWeight="semibold">TOTAL PASIVO</Text>
                  <Text fontSize="lg" fontWeight="extrabold">{parsePrice(trees.totals.totalLiabilities)}</Text>
                </Box>
              </HStack>
            </Flex> */}

            {/* Quick Metrics Cards */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} className="no-print">
              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Activos
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color="brand.primary" mt={2}>
                  {parsePrice(trees.totals.totalAssets)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Bienes y derechos de la empresa
                </Text>
              </Box>

              <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Pasivos
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color="red.600" mt={2}>
                  {parsePrice(trees.totals.totalLiabilities)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Obligaciones y deudas vigentes
                </Text>
              </Box>
            </SimpleGrid>

            {/* Tree Tables Section */}
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} className="print-grid">
              {/* Left Column: Assets */}
              <Stack gap={3} className="print-col">
                <Heading size="md" color="gray.700" pl={1} borderLeft="4px solid" borderColor="brand.primary" py={1} display="flex" >
                  <Text>1. Activos</Text>
                  <Badge variant="subtle" colorPalette="green" size="md">
                    Total: {parsePrice(trees.totals.totalAssets)}
                  </Badge>
                </Heading>
                <TableTree
                  codeHeader="Código"
                  conceptHeader="Cuenta de Activos"
                  notesHeader="Tipo"
                  valueHeaders={["Saldo Final"]}
                  data={trees.activoRows}
                  valueRenderers={valueRenderers}
                  showToggleButtons={false}
                  showDecimals={false}
                  minheight="350px"
                />
              </Stack>

              {/* Right Column: Liabilities */}
              <Stack gap={3} className="print-col">
                <Heading size="md" color="gray.700" pl={1} borderLeft="4px solid" borderColor="red.500" py={1} display="flex">
                  <Text>2. Pasivos</Text>
                  <Badge variant="subtle" colorPalette="red" size="md">
                    Total: {parsePrice(trees.totals.totalLiabilities)}
                  </Badge>
                </Heading>
                <TableTree
                  codeHeader="Código"
                  conceptHeader="Cuenta de Pasivos"
                  notesHeader="Tipo"
                  valueHeaders={["Saldo Final"]}
                  data={trees.pasivoRows}
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
