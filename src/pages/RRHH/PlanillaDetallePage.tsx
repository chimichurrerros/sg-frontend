import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Card, createListCollection, Grid, Heading, HStack, Input, InputGroup, Portal, Select, Stack, Table, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuCalculator, LuRefreshCw, LuSearch } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { useAllEmployees } from "@/queries/employees.queries";
import { useCalculatePayrollProcess, useCloseAndPayPayrollProcess, useGetPayrollProcess } from "@/queries/payroll-processes.queries";
import type { PayrollProcessCalculationResponseDto } from "@/api/payroll-processes.api";
import { parseApiError } from "@/utils/api-error";
import { toaster } from "@/components/ui/toaster";
import { formatStatusColor, translatePayrollStatus } from "@/constants/payroll";

const formatDate = (value?: string | null) => (value ? parseDate(value) : "-");

export default function PlanillaDetallePage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const processId = Number(params.id);

  const processQuery = useGetPayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const employeesQuery = useAllEmployees();
  const calculatePayrollProcess = useCalculatePayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const closeAndPayPayrollProcess = useCloseAndPayPayrollProcess(Number.isFinite(processId) ? processId : undefined);

  const summaryRef = useRef<HTMLDivElement>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [calculationSummary, setCalculationSummary] = useState<PayrollProcessCalculationResponseDto | null>(null);

  const process = processQuery.data ?? null;
  const employees = useMemo(() => employeesQuery.data?.employees ?? [], [employeesQuery.data]);

  const branchOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => String(employee.branchId ?? ""))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    [employees],
  );

  const areaOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.areaName ?? String(employee.areaId))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [employees],
  );

  const positionOptions = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.positionName ?? "-")))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [employees],
  );

  const branchFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Sucursales", value: "" },
          ...branchOptions.map((option) => ({ label: `Sucursal #${option}`, value: option })),
        ],
      }),
    [branchOptions],
  );

  const areaFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Áreas", value: "" },
          ...areaOptions.map((option) => ({ label: option, value: option })),
        ],
      }),
    [areaOptions],
  );

  const positionFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todos los Cargos", value: "" },
          ...positionOptions.map((option) => ({ label: option, value: option })),
        ],
      }),
    [positionOptions],
  );

  const filteredEmployees = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !term ||
        [
          employee.legajo,
          employee.firstName,
          employee.lastName,
          employee.documentNumber,
          employee.areaName ?? String(employee.areaId),
          employee.positionName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesBranch = !branchFilter || String(employee.branchId ?? "") === branchFilter;
      const matchesArea = !areaFilter || (employee.areaName ?? String(employee.areaId)) === areaFilter;
      const matchesPosition = !positionFilter || (employee.positionName ?? "-") === positionFilter;

      return matchesSearch && matchesBranch && matchesArea && matchesPosition;
    });
  }, [employees, employeeSearch, branchFilter, areaFilter, positionFilter]);

  useEffect(() => {
    setSelectedEmployeeIds([]);
    setCalculationSummary(null);
  }, [processId]);

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId)
        ? current.filter((item) => item !== employeeId)
        : [...current, employeeId],
    );
  };

  const selectVisibleEmployees = () => {
    setSelectedEmployeeIds(filteredEmployees.map((employee) => employee.id));
  };

  const clearSelection = () => {
    setSelectedEmployeeIds([]);
  };

  const handleCalculate = async () => {
    if (!process) return;

    try {
      const summary = await calculatePayrollProcess.mutateAsync();
      setCalculationSummary(summary);
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo calcular la planilla", description: parsed.message, type: "error" });
    }
  };

  const handleCloseProcess = async () => {
    if (!process) return;

    try {
      await closeAndPayPayrollProcess.mutateAsync();
      await processQuery.refetch();
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo cerrar la planilla", description: parsed.message, type: "error" });
    }
  };

  const selectedCount = selectedEmployeeIds.length;

  return (
    <Stack gap={5} p={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Stack gap={1}>
          <Button variant="ghost" size="sm" alignSelf="flex-start" onClick={() => navigate("/rrhh/planillas")}>
            <LuArrowLeft /> Volver
          </Button>
          <Heading size="xl">{process?.name ?? "Detalle de planilla"}</Heading>
          <Text color="fg.muted">
            RR.HH. &gt; Planillas &gt; {process?.name ?? "Planilla"}
          </Text>
        </Stack>

        <HStack flexWrap="wrap" justify="flex-end" gap={2}>
          {process?.payrollStatusName && (
            <Badge colorPalette={formatStatusColor(process.payrollStatusName)}>{translatePayrollStatus(process.payrollStatusName)}</Badge>
          )}
          <Button variant="outline" onClick={() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            Resumen
          </Button>
          <Button variant="outline" colorPalette="brand" onClick={handleCalculate} loading={calculatePayrollProcess.isPending} disabled={!process}>
            <LuCalculator /> Calcular planilla
          </Button>
          <Button colorPalette="brand" onClick={handleCloseProcess} loading={closeAndPayPayrollProcess.isPending} disabled={!process}>
            <LuRefreshCw /> Cerrar planilla
          </Button>
        </HStack>
      </HStack>

      <Card.Root variant="outline">
        <Card.Body>
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
            <Box>
              <Text fontSize="sm" color="fg.muted">Tipo</Text>
              <Text fontWeight="semibold">{process?.processTypeName ?? "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted">Período</Text>
              <Text fontWeight="semibold">{process ? `${process.month}/${process.year}` : "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted">Fecha de Alta</Text>
              <Text fontWeight="semibold">{formatDate(process?.startDate)}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted">Fecha de Pago</Text>
              <Text fontWeight="semibold">{formatDate(process?.payDate)}</Text>
            </Box>
          </Grid>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">Seleccionar empleados</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", md: "24rem" }}>
                <Input
                  placeholder="Buscar por nombre, legajo..."
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                />
              </InputGroup>
              <Badge colorPalette="gray">{selectedCount} seleccionados</Badge>
            </HStack>

            <HStack flexWrap="wrap" gap={3}>
              <Box minW="200px">
                <Select.Root
                  collection={branchFilterCollection}
                  value={[branchFilter]}
                  onValueChange={(event) => setBranchFilter(event.value[0] ?? "")}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Todas las Sucursales" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.ClearTrigger />
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {branchFilterCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>

              <Box minW="200px">
                <Select.Root
                  collection={areaFilterCollection}
                  value={[areaFilter]}
                  onValueChange={(event) => setAreaFilter(event.value[0] ?? "")}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Todas las Áreas" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.ClearTrigger />
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {areaFilterCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>

              <Box minW="200px">
                <Select.Root
                  collection={positionFilterCollection}
                  value={[positionFilter]}
                  onValueChange={(event) => setPositionFilter(event.value[0] ?? "")}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Todos los Cargos" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.ClearTrigger />
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {positionFilterCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>

              <HStack flexWrap="wrap" gap={2}>
                <Button variant="outline" onClick={selectVisibleEmployees}>Seleccionar visibles</Button>
                <Button variant="outline" onClick={clearSelection}>Limpiar</Button>
              </HStack>
            </HStack>

            <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="360px">
              <Table.Root size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader w="50px">Sel.</Table.ColumnHeader>
                    <Table.ColumnHeader>Legajo</Table.ColumnHeader>
                    <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                    <Table.ColumnHeader>Sucursal</Table.ColumnHeader>
                    <Table.ColumnHeader>Área</Table.ColumnHeader>
                    <Table.ColumnHeader>Cargo</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredEmployees.map((employee) => (
                    <Table.Row
                      key={employee.id}
                      cursor="pointer"
                      bg={selectedEmployeeIds.includes(employee.id) ? "green.50" : "transparent"}
                      _hover={{ bg: selectedEmployeeIds.includes(employee.id) ? "green.50" : "gray.50" }}
                      onClick={() => toggleEmployeeSelection(employee.id)}
                    >
                      <Table.Cell>
                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.includes(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                        />
                      </Table.Cell>
                      <Table.Cell>{employee.legajo}</Table.Cell>
                      <Table.Cell>
                        {employee.firstName} {employee.lastName}
                      </Table.Cell>
                      <Table.Cell>{employee.branchId ? `#${employee.branchId}` : "-"}</Table.Cell>
                      <Table.Cell>{employee.areaName ?? employee.areaId}</Table.Cell>
                      <Table.Cell>{employee.positionName ?? "-"}</Table.Cell>
                    </Table.Row>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={6} textAlign="center" py={8}>
                        Sin funcionarios para mostrar
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root ref={summaryRef} id="resumen" variant="outline">
        <Card.Header>
          <Heading size="md">Resumen de la planilla</Heading>
        </Card.Header>
        <Card.Body>
          {calculationSummary ? (
            <Stack gap={3}>
              <HStack wrap="wrap" gap={3}>
                <Badge colorPalette="green">Empleados: {calculationSummary.employeesProcessed}</Badge>
                <Badge colorPalette="blue">Haberes: {parsePrice(calculationSummary.totalHaberes)}</Badge>
                <Badge colorPalette="orange">Descuentos: {parsePrice(calculationSummary.totalDescuentos)}</Badge>
                <Badge colorPalette="purple">Neto: {parsePrice(calculationSummary.totalNeto)}</Badge>
              </HStack>

              {calculationSummary.employees?.length > 0 ? (
                <Box borderWidth="1px" borderColor="gray.200" rounded="md" overflow="hidden">
                  <Table.ScrollArea>
                    <Table.Root size="sm" stickyHeader>
                      <Table.Header>
                        <Table.Row bg="bg.subtle">
                          <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                          <Table.ColumnHeader>Salario Base</Table.ColumnHeader>
                          <Table.ColumnHeader>Jornal</Table.ColumnHeader>
                          <Table.ColumnHeader>Días</Table.ColumnHeader>
                          <Table.ColumnHeader>Haberes</Table.ColumnHeader>
                          <Table.ColumnHeader>Descuentos</Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="end">Neto</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {calculationSummary.employees.map((employee) => (
                          <Table.Row key={employee.employeeId}>
                            <Table.Cell>{employee.employeeName}</Table.Cell>
                            <Table.Cell>{employee.salarioBase.toFixed(2)}</Table.Cell>
                            <Table.Cell>{employee.jornalDiario.toFixed(2)}</Table.Cell>
                            <Table.Cell>{employee.diasTrabajados}</Table.Cell>
                            <Table.Cell>{employee.totalHaberes.toFixed(2)}</Table.Cell>
                            <Table.Cell>{employee.totalDescuentos.toFixed(2)}</Table.Cell>
                            <Table.Cell textAlign="end">{employee.totalNeto.toFixed(2)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Table.ScrollArea>
                </Box>
              ) : (
                <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
                  <Text fontSize="sm">El cálculo no devolvió filas detalladas.</Text>
                </Box>
              )}
            </Stack>
          ) : (
            <Text color="fg.muted">Aún no se ejecutó el cálculo para esta planilla.</Text>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}