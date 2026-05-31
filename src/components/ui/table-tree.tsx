import React, { useState, useMemo } from "react";
import { Box, Table, Flex, Text, Button, HStack } from "@chakra-ui/react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface TreeTableRow {
  id: string | number;
  code: string;
  name: string;
  notes?: string;
  values?: (number | null)[]; // One amount per value column
  isGroup: boolean; // True if it can contain children / collapsable
  depth: number; // 0-based depth for indentation
  parentId?: string | number | null;
}

export interface TableTreeProps {
  codeHeader?: string;
  conceptHeader?: string;
  notesHeader?: string;
  valueHeaders: string[]; // Headers for the amount columns (e.g. ["Periodo Actual (2026)", "Periodo Anterior (2025)"])
  data: TreeTableRow[];
  height?: string;
  maxHeight?: string;
  minheight?: string;
  showDecimals?: boolean;
  showToggleButtons?: boolean; // Show Expand All / Collapse All buttons at the top
  valueRenderers?: ((val: any, row: TreeTableRow) => React.ReactNode)[]; // Custom renderer for each value column
}

export function formatAccountingPrice(amount: number | null | undefined, showDecimals = true): string {
  if (amount === null || amount === undefined) return "";
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  const formatted = new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absVal);

  return isNegative ? `(${formatted})` : formatted;
}

export default function TableTree({
  codeHeader = "Código",
  conceptHeader = "Concepto (Cuenta)",
  notesHeader = "Notas",
  valueHeaders,
  data,
  height,
  maxHeight = "70vh",
  minheight = "300px",
  showDecimals = true,
  showToggleButtons = true,
  valueRenderers,
}: TableTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string | number, boolean>>({});

  const rowsMap = useMemo(() => {
    const map: Record<string | number, TreeTableRow> = {};
    for (const row of data) {
      map[row.id] = row;
    }
    return map;
  }, [data]);

  const toggleCollapsed = (id: string | number) => {
    setCollapsed((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    setCollapsed({});
  };

  const collapseAll = () => {
    const newCollapsed: Record<string | number, boolean> = {};
    for (const row of data) {
      if (row.isGroup) {
        newCollapsed[row.id] = true;
      }
    }
    setCollapsed(newCollapsed);
  };

  const visibleRows = useMemo(() => {
    return data.filter((row) => {
      let currentParentId = row.parentId;
      while (currentParentId !== undefined && currentParentId !== null) {
        if (collapsed[currentParentId]) {
          return false;
        }
        const parentRow = rowsMap[currentParentId];
        if (!parentRow) break;
        currentParentId = parentRow.parentId;
      }
      return true;
    });
  }, [data, collapsed, rowsMap]);

  return (
    <Box display="flex" flexDirection="column" gap={3} width="100%">
      {/* Control Buttons */}
      {showToggleButtons && (
        <HStack gap={2} justify="flex-end">
          <Button
            variant="ghost"
            size="xs"
            onClick={expandAll}
            fontSize="11px"
            fontWeight="semibold"
            color="brand.primary"
            _hover={{ bg: "gray.100" }}
          >
            Expandir Todo
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={collapseAll}
            fontSize="11px"
            fontWeight="semibold"
            color="brand.primary"
            _hover={{ bg: "gray.100" }}
          >
            Colapsar Todo
          </Button>
        </HStack>
      )}

      {/* Table Area */}
      <Table.ScrollArea
        borderWidth="1px"
        borderColor="gray.200"
        rounded="lg"
        height={height || "100%"}
        minHeight={minheight}
        maxHeight={maxHeight}
        bg="white"
        shadow="xs"
      >
        <Table.Root size="sm" stickyHeader>
          <Table.Header>
            <Table.Row bg="gray.50">
              {/* Code Header */}
              <Table.ColumnHeader width="12%" fontWeight="bold" fontSize="xs" color="gray.700" pl={5} py={3}>
                {codeHeader}
              </Table.ColumnHeader>

              {/* Concept Header */}
              <Table.ColumnHeader width="45%" fontWeight="bold" fontSize="xs" color="gray.700" pl={5} py={3}>
                {conceptHeader}
              </Table.ColumnHeader>

              {/* Notes Header */}
              {notesHeader && (
                <Table.ColumnHeader width="13%" fontWeight="bold" fontSize="xs" color="gray.700" pl={5} py={3}>
                  {notesHeader}
                </Table.ColumnHeader>
              )}

              {/* Dynamic Value Headers */}
              {valueHeaders.map((vh, idx) => (
                <Table.ColumnHeader
                  key={idx}
                  textAlign="end"
                  fontWeight="bold"
                  fontSize="xs"
                  color="gray.700"
                  pr={5}
                  py={3}
                >
                  {vh}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {visibleRows.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={3 + valueHeaders.length}
                  textAlign="center"
                  py={10}
                  color="gray.500"
                  fontSize="sm"
                >
                  No hay datos para mostrar en este momento.
                </Table.Cell>
              </Table.Row>
            ) : (
              visibleRows.map((row) => {
                const isCollapsed = collapsed[row.id];
                const isTopLevel = row.depth === 0;

                return (
                  <Table.Row
                    key={row.id}
                    bg={isTopLevel ? "gray.50" : "transparent"}
                    _hover={{ bg: "gray.50" }}
                    transition="background-color 0.15s ease"
                    borderBottomWidth={isTopLevel ? "1.5px" : "1px"}
                    borderBottomColor={isTopLevel ? "gray.200" : "gray.100"}
                    borderLeftWidth={isTopLevel ? "4px" : "0px"}
                    borderLeftColor={isTopLevel ? "brand.primary" : "transparent"}
                  >
                    {/* Code Cell */}
                    <Table.Cell
                      fontWeight={isTopLevel ? "bold" : "normal"}
                      color={isTopLevel ? "brand.primary" : "gray.400"}
                      fontSize="xs"
                      py={2.5}
                      pl={5}
                    >
                      {row.code}
                    </Table.Cell>

                    {/* Concept Cell with Tree Controls */}
                    <Table.Cell py={2.5} pl={5}>
                      <Flex align="center" gap={1.5} pl={`${row.depth * 16}px`}>
                        {row.isGroup ? (
                          <Box
                            as="button"
                            onClick={() => toggleCollapsed(row.id)}
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            w="18px"
                            h="18px"
                            borderRadius="sm"
                            cursor="pointer"
                            color="gray.500"
                            _hover={{ bg: "gray.100", color: "gray.700" }}
                            transition="all 0.2s"
                          >
                            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                          </Box>
                        ) : (
                          <Box w="18px" />
                        )}


                        <Text
                          fontSize="xs"
                          fontWeight={row.depth === 0 ? "bold" : row.depth === 1 ? "semibold" : "normal"}
                          color={row.depth === 0 ? "gray.900" : row.depth === 1 ? "gray.850" : "gray.750"}
                          textTransform={row.depth === 0 ? "uppercase" : "none"}
                        >
                          {row.name}
                        </Text>
                      </Flex>
                    </Table.Cell>

                    {/* Notes Cell */}
                    {notesHeader && (
                      <Table.Cell fontSize="xs" color="gray.600" py={2.5} pl={5}>
                        {row.notes || ""}
                      </Table.Cell>
                    )}

                    {/* Dynamic Value Cells */}
                    {valueHeaders.map((_, idx) => {
                      const val = row.values?.[idx];
                      return (
                        <Table.Cell
                          key={idx}
                          textAlign="end"
                          fontWeight={row.depth === 0 ? "bold" : row.depth === 1 ? "semibold" : "normal"}
                          color={row.depth === 0 ? "gray.900" : "gray.800"}
                          fontSize="xs"
                          py={2.5}
                          pr={5}
                        >
                          {valueRenderers && valueRenderers[idx]
                            ? valueRenderers[idx](val, row)
                            : (val !== undefined && val !== null ? formatAccountingPrice(val, showDecimals) : "")}
                        </Table.Cell>
                      );
                    })}
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
