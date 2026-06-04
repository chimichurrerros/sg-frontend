import { useMemo, useState } from "react";
import { Badge, Box, Button, Card, CloseButton, createListCollection, Dialog, Grid, Heading, HStack, Input, InputGroup, Portal, Select, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuCheck, LuRefreshCw, LuSearch, LuTrash2, LuBanknote, LuPrinter, LuPlus } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { parseDate, parseDateTime } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { processTypeNameMap, formatStatusColor, translatePayrollStatus, PayrollStatusId } from "@/constants/payroll";
import { useAddEmployees, useCloseAndPayPayrollProcess, useGetEligibleEmployees, useGetPayrollDetailSummaries, useGetPayrollProcess, useRemoveEmployeeFromProcess, useClosePayrollProcess } from "@/queries/payroll-processes.queries";
import { useGetAccounts } from "@/queries/accounts.queries";
import { useCreateMovement } from "@/queries/bankMovements.queries";
import type { EligibleEmployeeResponseDto, PayrollDetailSummaryResponseDto } from "@/api/payroll-processes.api";
import { parseApiError } from "@/utils/api-error";
import { toaster } from "@/components/ui/toaster";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import type { PaginationParams } from "@/types/types";
import EmployeePayrollDetailModal from "./EmployeePayrollDetailModal";
import ConceptSummaryModal from "./ConceptSummaryModal";
import PayrollBatchReceipt from "./PayrollBatchReceipt";

const formatDate = (value?: string | null) => (value ? parseDate(value) : "-");

const toLocalISO = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

export default function PlanillaDetallePage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const processId = Number(params.id);

  const [summarySearch, setSummarySearch] = useState("");
  const [summaryPage, setSummaryPage] = useState(1);
  const [summaryPageSize, setSummaryPageSize] = useState(10);

  const processQuery = useGetPayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const eligibleQuery = useGetEligibleEmployees(Number.isFinite(processId) ? processId : undefined);
  const summariesQuery = useGetPayrollDetailSummaries(Number.isFinite(processId) ? processId : undefined, summaryPage, summaryPageSize);
  const addEmployeesMutation = useAddEmployees(Number.isFinite(processId) ? processId : undefined);
  const closeAndPayMutation = useCloseAndPayPayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const removeEmployeeMutation = useRemoveEmployeeFromProcess(Number.isFinite(processId) ? processId : undefined);
  const closeProcessMutation = useClosePayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const accountsQuery = useGetAccounts({ pageSize: 100 });
  const createMovementMutation = useCreateMovement();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const [modalEmployee, setModalEmployee] = useState<{ id: number; name: string } | null>(null);
  const [conceptSummaryOpen, setConceptSummaryOpen] = useState(false);
  const [batchReceiptOpen, setBatchReceiptOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [payConfirmOpen, setPayConfirmOpen] = useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);

  const process = processQuery.data ?? null;
  const eligibleEmployees = eligibleQuery.data ?? [];
  const summariesWrapper = summariesQuery.data;
  const summaries = summariesWrapper?.summaries ?? [];
  const pagination = summariesWrapper?.pagination ?? null;
  const isProcessOpen = process?.payrollStatusId === PayrollStatusId.Open;
  const isClosed = process?.payrollStatusId === PayrollStatusId.Closed;
  const isPaid = process?.payrollStatusId === PayrollStatusId.Paid;

  const branchOptions = useMemo(
    () =>
      Array.from(new Set(eligibleEmployees.map((emp) => emp.branchName ?? "")))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    [eligibleEmployees],
  );

  const areaOptions = useMemo(
    () =>
      Array.from(new Set(eligibleEmployees.map((emp) => emp.areaName ?? "")))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [eligibleEmployees],
  );

  const positionOptions = useMemo(
    () =>
      Array.from(new Set(eligibleEmployees.map((emp) => emp.positionName ?? "")))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [eligibleEmployees],
  );

  const branchFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Sucursales", value: "" },
          ...branchOptions.map((opt) => ({ label: opt, value: opt })),
        ],
      }),
    [branchOptions],
  );

  const areaFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todas las Áreas", value: "" },
          ...areaOptions.map((opt) => ({ label: opt, value: opt })),
        ],
      }),
    [areaOptions],
  );

  const positionFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todos los Cargos", value: "" },
          ...positionOptions.map((opt) => ({ label: opt, value: opt })),
        ],
      }),
    [positionOptions],
  );

  const bankAccountCollection = useMemo(() => {
    const bankAccounts = accountsQuery.data?.accounts ?? [];
    const activeAccounts = bankAccounts.filter((a) => a.isActive);
    return createListCollection({
      items: [
        ...activeAccounts.map((a) => ({
          label: `${a.name ?? "Sin nombre"} ${a.accountNumber ? `(${a.accountNumber})` : ""}`,
          value: String(a.id),
        })),
      ],
    });
  }, [accountsQuery.data]);

  const filteredEligible = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();
    return eligibleEmployees.filter((emp) => {
      const matchesSearch =
        !term ||
        [emp.fileNumber, emp.firstName, emp.lastName, emp.areaName, emp.positionName]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesBranch = !branchFilter || emp.branchName === branchFilter;
      const matchesArea = !areaFilter || emp.areaName === areaFilter;
      const matchesPosition = !positionFilter || emp.positionName === positionFilter;
      return matchesSearch && matchesBranch && matchesArea && matchesPosition;
    });
  }, [eligibleEmployees, employeeSearch, branchFilter, areaFilter, positionFilter]);

  const allFilteredSelected = useMemo(
    () => filteredEligible.length > 0 && filteredEligible.every((emp) => selectedIds.includes(emp.id)),
    [filteredEligible, selectedIds],
  );

  const toggleEmployee = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredEligible.some((emp) => emp.id === id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredEligible.map((emp) => emp.id)]);
      setSelectedIds([...newIds]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleAddEmployees = async () => {
    if (selectedIds.length === 0) {
      toaster.create({ title: "Selecciona al menos un empleado", type: "error" });
      return;
    }
    try {
      await addEmployeesMutation.mutateAsync({ employeeIds: selectedIds });
      setSelectedIds([]);
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudieron añadir empleados", description: parsed.message, type: "error" });
    }
  };

  const selectedCount = selectedIds.length;

  const filteredSummaries = useMemo(() => {
    const term = summarySearch.trim().toLowerCase();
    if (!term) return summaries;
    return summaries.filter((s) =>
      [s.fileNumber, s.fullName, s.branchName, s.areaName, s.positionName]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [summaries, summarySearch]);

  return (
    <Stack gap={5} p={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Stack gap={1}>
          <Button variant="ghost" size="sm" alignSelf="flex-start" onClick={() => navigate("/rrhh/planillas")}>
            <LuArrowLeft /> Volver
          </Button>
          <Heading size="xl">{process?.name ?? "Detalle de planilla"}</Heading>
        </Stack>

        <HStack flexWrap="wrap" justify="flex-end" gap={2}>
          {process?.payrollStatusName && (
            <Badge colorPalette={formatStatusColor(process.payrollStatusName)}>
              {translatePayrollStatus(process.payrollStatusName)}
            </Badge>
          )}
        </HStack>
      </HStack>

      <Card.Root variant="outline">
        <Card.Body>
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
            <Box>
              <Text fontSize="sm" color="fg.muted">Tipo</Text>
              <Text fontWeight="semibold">{process ? processTypeNameMap[process.processTypeId] ?? process.processTypeName : "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted">Período</Text>
              <Text fontWeight="semibold">{process ? `${process.month}/${process.year}` : "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted">Fecha de Alta</Text>
              <Text fontWeight="semibold">{process?.closedAt ? parseDateTime(process.closedAt) : formatDate(process?.startDate)}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted">Fecha de Pago</Text>
              <Text fontWeight="semibold">{process?.paidAt ? parseDateTime(process.paidAt) : formatDate(process?.payDate)}</Text>
            </Box>
          </Grid>
        </Card.Body>
      </Card.Root>

      {isProcessOpen && !showEmployeeSelector && (
        <Card.Root
          variant="outline"
          cursor="pointer"
          onClick={() => setShowEmployeeSelector(true)}
          _hover={{ bg: "gray.50", borderColor: "brand.500" }}
          transition="all 0.15s"
        >
          <Card.Body py={6}>
            <HStack justify="space-between">
              <HStack gap={3}>
                <Box
                  w={10}
                  h={10}
                  rounded="full"
                  bg="brand.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <LuPlus size={20} />
                </Box>
                <Stack gap={0}>
                  <Heading size="md" fontWeight="semibold">Agregar Empleados</Heading>
                  <Text fontSize="sm" color="fg.muted">Añadir empleados disponibles a esta planilla</Text>
                </Stack>
              </HStack>
              <Badge colorPalette="brand">{eligibleEmployees.length} disponibles</Badge>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {isProcessOpen && showEmployeeSelector && (
      <Card.Root variant="outline">
        <Card.Header>
          <HStack justify="space-between">
            <Heading size="md">Empleados Disponibles</Heading>
            <CloseButton onClick={() => setShowEmployeeSelector(false)} />
          </HStack>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", md: "24rem" }}>
                <Input
                  placeholder="Buscar por legajo, nombre..."
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
                <Button variant="outline" onClick={clearSelection} disabled={selectedIds.length === 0}>
                  Limpiar
                </Button>
              </HStack>
            </HStack>

            {eligibleQuery.isPending ? (
              <Box py={8} textAlign="center">
                <Spinner />
                <Text mt={2} color="fg.muted">Cargando empleados disponibles...</Text>
              </Box>
            ) : eligibleQuery.isError ? (
              <Box py={8} textAlign="center">
                <Text color="red.500">Error al cargar empleados disponibles.</Text>
              </Box>
            ) : (
              <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="360px">
                <Table.Root size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader w="50px">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleAll}
                          disabled={!isProcessOpen}
                        />
                      </Table.ColumnHeader>
                      <Table.ColumnHeader>Legajo</Table.ColumnHeader>
                      <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                      <Table.ColumnHeader>Sucursal</Table.ColumnHeader>
                      <Table.ColumnHeader>Área</Table.ColumnHeader>
                      <Table.ColumnHeader>Cargo</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredEligible.map((emp) => (
                      <Table.Row
                        key={emp.id}
                        cursor="pointer"
                        bg={selectedIds.includes(emp.id) ? "green.50" : "transparent"}
                        _hover={{ bg: selectedIds.includes(emp.id) ? "green.50" : "gray.50" }}
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <Table.Cell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                        </Table.Cell>
                        <Table.Cell>{emp.fileNumber}</Table.Cell>
                        <Table.Cell>{emp.firstName} {emp.lastName}</Table.Cell>
                        <Table.Cell>{emp.branchName ?? "-"}</Table.Cell>
                        <Table.Cell>{emp.areaName ?? "-"}</Table.Cell>
                        <Table.Cell>{emp.positionName ?? "-"}</Table.Cell>
                      </Table.Row>
                    ))}
                    {filteredEligible.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan={6} textAlign="center" py={8}>
                          {eligibleEmployees.length === 0
                            ? "Todos los empleados ya fueron añadidos a esta planilla"
                            : "Sin resultados para los filtros aplicados"}
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            )}

            <HStack justify="flex-end" gap={3}>
              <Button
                colorPalette="brand"
                onClick={handleAddEmployees}
                loading={addEmployeesMutation.isPending}
                disabled={selectedIds.length === 0 || !isProcessOpen}
              >
                <LuCheck /> Agregar
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>
      )}

      <Card.Root variant="outline">
        <Card.Header>
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
            <Heading size="md">Resultados de Pre-Liquidación</Heading>
            {summaries.length > 0 && (
              <HStack gap={2} flexWrap="wrap">
                <Button variant="outline" size="sm" onClick={() => setConceptSummaryOpen(true)}>
                  Resumen
                </Button>
                {isProcessOpen && (
                  <Button size="sm" colorPalette="brand" onClick={() => setCloseConfirmOpen(true)} loading={closeProcessMutation.isPending}>
                    <LuRefreshCw /> Cerrar Planilla
                  </Button>
                )}
                {isClosed && (
                  <Button size="sm" colorPalette="brand" onClick={() => setPayConfirmOpen(true)} loading={closeAndPayMutation.isPending}>
                    <LuBanknote /> Proceder al pago
                  </Button>
                )}
                {isPaid && (
                  <Button size="sm" colorPalette="brand" variant="outline" onClick={() => setBatchReceiptOpen(true)}>
                    <LuPrinter /> Imprimir
                  </Button>
                )}
              </HStack>
            )}
          </HStack>
        </Card.Header>
        <Card.Body>
          {summariesQuery.isPending ? (
            <Box py={8} textAlign="center">
              <Spinner />
              <Text mt={2} color="fg.muted">Cargando resultados...</Text>
            </Box>
          ) : summariesQuery.isError ? (
            <Box py={8} textAlign="center">
              <Text color="red.500">Error al cargar los resultados de la planilla.</Text>
            </Box>
          ) : (summariesWrapper && summaries.length === 0) ? (
            <Text color="fg.muted">Aún no se han añadido empleados a esta planilla.</Text>
          ) : (
            <Stack gap={4}>
              <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", md: "24rem" }}>
                <Input
                  placeholder="Buscar por legajo, nombre, sucursal..."
                  value={summarySearch}
                  onChange={(event) => setSummarySearch(event.target.value)}
                />
              </InputGroup>
              <HStack wrap="wrap" gap={3}>
                <Badge colorPalette="green">Empleados: {filteredSummaries.length}</Badge>
                <Badge colorPalette="blue">Ingresos: {parsePrice(filteredSummaries.reduce((sum, s) => sum + s.sueldoBruto, 0))}</Badge>
                <Badge colorPalette="orange">Egresos: {parsePrice(filteredSummaries.reduce((sum, s) => sum + s.descuentos, 0))}</Badge>
                <Badge colorPalette="purple">Neto: {parsePrice(filteredSummaries.reduce((sum, s) => sum + s.sueldoNeto, 0))}</Badge>
              </HStack>

              <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="400px">
                <Table.Root size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row bg="bg.subtle">
                      <Table.ColumnHeader>Legajo</Table.ColumnHeader>
                      <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                      <Table.ColumnHeader>Sucursal</Table.ColumnHeader>
                      <Table.ColumnHeader>Área</Table.ColumnHeader>
                      <Table.ColumnHeader>Cargo</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Ingresos</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Egresos</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Salario Neto</Table.ColumnHeader>
                      <Table.ColumnHeader w="50px">Acciones</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredSummaries.map((row) => (
                      <Table.Row
                        key={row.employeeId}
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                        onDoubleClick={() => setModalEmployee({ id: row.employeeId, name: row.fullName })}
                      >
                        <Table.Cell>{row.fileNumber}</Table.Cell>
                        <Table.Cell>{row.fullName}</Table.Cell>
                        <Table.Cell>{row.branchName ?? "-"}</Table.Cell>
                        <Table.Cell>{row.areaName ?? "-"}</Table.Cell>
                        <Table.Cell>{row.positionName ?? "-"}</Table.Cell>
                        <Table.Cell textAlign="end">{parsePrice(row.sueldoBruto)}</Table.Cell>
                        <Table.Cell textAlign="end">{parsePrice(row.descuentos)}</Table.Cell>
                        <Table.Cell textAlign="end" fontWeight="semibold">{parsePrice(row.sueldoNeto)}</Table.Cell>
                        <Table.Cell>
                          {isProcessOpen && (
                            <Button
                              size="xs"
                              variant="ghost"
                              colorPalette="red"
                              onClick={(e) => { e.stopPropagation(); setRemoveTargetId(row.employeeId); setRemoveConfirmOpen(true); }}
                            >
                              <LuTrash2 />
                            </Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {filteredSummaries.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan={9} textAlign="center" py={8}>
                          Sin resultados para la búsqueda
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>

              {pagination && (
                <HStack justify="space-between" align="center">
                  <PageSizeControl
                    params={{ page: summaryPage, pageSize: summaryPageSize }}
                    paramsChangeFunction={(next: PaginationParams) => {
                      setSummaryPageSize(next.pageSize ?? 10);
                      setSummaryPage(1);
                    }}
                    min={5}
                    max={30}
                  />
                  <PaginationControl pagination={pagination} onPageChange={(page: number) => setSummaryPage(page)} />
                </HStack>
              )}
            </Stack>
          )}
        </Card.Body>
      </Card.Root>



      <EmployeePayrollDetailModal
        processId={processId}
        employeeId={modalEmployee?.id ?? 0}
        employeeName={modalEmployee?.name ?? ""}
        open={modalEmployee !== null}
        onClose={() => setModalEmployee(null)}
      />

      <ConceptSummaryModal
        processId={processId}
        open={conceptSummaryOpen}
        onClose={() => setConceptSummaryOpen(false)}
      />

      {batchReceiptOpen && (
        <PayrollBatchReceipt
          processId={processId}
          summaries={summaries}
          onClose={() => setBatchReceiptOpen(false)}
        />
      )}

      <Dialog.Root open={closeConfirmOpen} onOpenChange={(e) => { if (!e.open) setCloseConfirmOpen(false); }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
            <Dialog.Content>
              <Dialog.Header display="flex" alignItems="center" gap={2}>
                <Dialog.Title fontSize="lg" fontWeight="semibold">Cerrar Planilla</Dialog.Title>
                <Dialog.CloseTrigger asChild><CloseButton size="sm" /></Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body pb={4}>
                <Text fontSize="sm">¿Estás seguro de cerrar esta planilla? Una vez cerrada, deberás proceder al pago para finalizar el proceso.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="surface" colorPalette="gray" onClick={() => setCloseConfirmOpen(false)}>Cancelar</Button>
                <Button colorPalette="brand" loading={closeProcessMutation.isPending} onClick={async () => {
                  try {
                    await closeProcessMutation.mutateAsync();
                    await processQuery.refetch();
                    await summariesQuery.refetch();
                  } catch (error) {
                    const parsed = parseApiError(error as unknown);
                    toaster.create({ title: "No se pudo cerrar la planilla", description: parsed.message, type: "error" });
                  } finally {
                    setCloseConfirmOpen(false);
                  }
                }}>Cerrar</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={payConfirmOpen} onOpenChange={(e) => { if (!e.open) setPayConfirmOpen(false); }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
            <Dialog.Content>
              <Dialog.Header display="flex" alignItems="center" gap={2}>
                <Dialog.Title fontSize="lg" fontWeight="semibold">Proceder al pago</Dialog.Title>
                <Dialog.CloseTrigger asChild><CloseButton size="sm" /></Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body pb={4}>
                <Stack gap={3}>
                  <Text fontSize="sm">¿Estás seguro de proceder al pago de esta planilla? Se generará el asiento contable correspondiente.</Text>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Cuenta Bancaria de Origen</Text>
                    <Select.Root collection={bankAccountCollection} size="sm" value={[selectedBankAccountId]} onValueChange={(e) => setSelectedBankAccountId(e.value[0] ?? "")}>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar cuenta bancaria" />
                      </Select.Trigger>
                      <Select.Content>
                        {bankAccountCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="surface" colorPalette="gray" onClick={() => { setPayConfirmOpen(false); setSelectedBankAccountId(""); }}>Cancelar</Button>
                <Button colorPalette="brand" loading={closeAndPayMutation.isPending || createMovementMutation.isPending} onClick={async () => {
                  if (!selectedBankAccountId) {
                    toaster.create({ title: "Selecciona una cuenta bancaria", type: "error" });
                    return;
                  }
                  try {
                    const data = await closeAndPayMutation.mutateAsync();
                    await createMovementMutation.mutateAsync({
                      accountId: Number(selectedBankAccountId),
                      amount: data.totalNetoPagado,
                      description: "Pago de Salarios",
                      date: toLocalISO(),
                      movementType: 1,
                    });
                    await processQuery.refetch();
                    await summariesQuery.refetch();
                  } catch (error) {
                    const parsed = parseApiError(error as unknown);
                    toaster.create({ title: "No se pudo procesar el pago", description: parsed.message, type: "error" });
                  } finally {
                    setPayConfirmOpen(false);
                    setSelectedBankAccountId("");
                  }
                }}>Pagar</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={removeConfirmOpen} onOpenChange={(e) => { if (!e.open) { setRemoveConfirmOpen(false); setRemoveTargetId(null); } }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
            <Dialog.Content>
              <Dialog.Header display="flex" alignItems="center" gap={2}>
                <Dialog.Title fontSize="lg" fontWeight="semibold">Eliminar empleado de planilla</Dialog.Title>
                <Dialog.CloseTrigger asChild><CloseButton size="sm" /></Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body pb={4}>
                <Text fontSize="sm">¿Estás seguro de eliminar este empleado de la planilla? Se borrarán todos sus detalles.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="surface" colorPalette="gray" onClick={() => { setRemoveConfirmOpen(false); setRemoveTargetId(null); }}>Cancelar</Button>
                <Button colorPalette="red" loading={removeEmployeeMutation.isPending} onClick={async () => {
                  if (removeTargetId === null) return;
                  try {
                    await removeEmployeeMutation.mutateAsync(removeTargetId);
                    await summariesQuery.refetch();
                    await eligibleQuery.refetch();
                    toaster.create({ title: "Empleado eliminado de la planilla", type: "success" });
                  } catch (error) {
                    const parsed = parseApiError(error as unknown);
                    toaster.create({ title: "No se pudo eliminar el empleado", description: parsed.message, type: "error" });
                  } finally {
                    setRemoveConfirmOpen(false);
                    setRemoveTargetId(null);
                  }
                }}>Eliminar</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  );
}
