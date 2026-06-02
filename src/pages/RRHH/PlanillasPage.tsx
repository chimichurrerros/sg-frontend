import { useMemo, useState } from "react";
import { Badge, Box, Button, Card, Heading, HStack, Input, InputGroup, Stack, Table, Text } from "@chakra-ui/react";
import { LuPlus, LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { parseDate } from "@/constants/date";
import { useGetPayrollProcesses } from "@/queries/payroll-processes.queries";
import { formatStatusColor, translatePayrollStatus } from "@/constants/payroll";

export default function PlanillasPage() {
  const navigate = useNavigate();
  const processesQuery = useGetPayrollProcesses();
  const [planillaSearch, setPlanillaSearch] = useState("");

  const processes = useMemo(() => processesQuery.data ?? [], [processesQuery.data]);

  const filteredProcesses = useMemo(() => {
    const term = planillaSearch.trim().toLowerCase();
    if (!term) return processes;

    return processes.filter((process) => {
      return [
        process.name,
        process.processTypeName,
        process.payrollStatusName,
        String(process.year),
        String(process.month),
        parseDate(process.startDate),
        process.payDate ? parseDate(process.payDate) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [processes, planillaSearch]);

  return (
    <Stack gap={5} p={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="xl">Planillas</Heading>
        </Box>
        <Button colorPalette="brand" onClick={() => navigate("/rrhh/planillas/nuevo")}>
          <LuPlus /> Nueva planilla
        </Button>
      </HStack>

      <Card.Root variant="outline">
        <Card.Body>
          <Stack gap={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", md: "24rem" }}>
                <Input
                  placeholder="Buscar planillas"
                  value={planillaSearch}
                  onChange={(event) => setPlanillaSearch(event.target.value)}
                />
              </InputGroup>
              <Badge colorPalette="gray">{filteredProcesses.length} planillas</Badge>
            </HStack>

            <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="520px">
              <Table.Root size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Nombre de Planilla</Table.ColumnHeader>
                    <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Alta</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Pago</Table.ColumnHeader>
                    <Table.ColumnHeader>Estado</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredProcesses.map((process) => (
                    <Table.Row
                      key={process.id}
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onDoubleClick={() => navigate(`/rrhh/planillas/${process.id}`)}
                    >
                      <Table.Cell>{process.name}</Table.Cell>
                      <Table.Cell>{process.processTypeName}</Table.Cell>
                      <Table.Cell>{parseDate(process.startDate)}</Table.Cell>
                      <Table.Cell>{process.payDate ? parseDate(process.payDate) : "-"}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={formatStatusColor(process.payrollStatusName)}>{translatePayrollStatus(process.payrollStatusName)}</Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filteredProcesses.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5} textAlign="center" py={8}>
                        Sin resultados de planillas
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
