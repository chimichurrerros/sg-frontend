import { useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Card, CloseButton, createListCollection, Dialog, Grid, Heading, HStack, Input, InputGroup, Portal, Select, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuCheck, LuRefreshCw, LuSearch, LuTrash2, LuBanknote } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { processTypeNameMap, formatStatusColor, translatePayrollStatus, PayrollStatusId } from "@/constants/payroll";
import { useAddEmployees, useCloseAndPayPayrollProcess, useGetEligibleEmployees, useGetPayrollDetailSummaries, useGetPayrollProcess, useRemoveEmployeeFromProcess, useClosePayrollProcess } from "@/queries/payroll-processes.queries";
import type { EligibleEmployeeResponseDto, PayrollDetailSummaryResponseDto } from "@/api/payroll-processes.api";
import { parseApiError } from "@/utils/api-error";
import { toaster } from "@/components/ui/toaster";
import EmployeePayrollDetailModal from "./EmployeePayrollDetailModal";

const formatDate = (value?: string | null) => (value ? parseDate(value) : "-");

export default function PlanillaDetallePage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const processId = Number(params.id);

  const processQuery = useGetPayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const eligibleQuery = useGetEligibleEmployees(Number.isFinite(processId) ? processId : undefined);
  const summariesQuery = useGetPayrollDetailSummaries(Number.isFinite(processId) ? processId : undefined);
  const addEmployeesMutation = useAddEmployees(Number.isFinite(processId) ? processId : undefined);
  const closeAndPayMutation = useCloseAndPayPayrollProcess(Number.isFinite(processId) ? processId : undefined);
  const removeEmployeeMutation = useRemoveEmployeeFromProcess(Number.isFinite(processId) ? processId : undefined);
  const closeProcessMutation = useClosePayrollProcess(Number.isFinite(processId) ? processId : undefined);

  const summaryRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const [modalEmployee, setModalEmployee] = useState<{ id: number; name: string } | null>(null);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [payConfirmOpen, setPayConfirmOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);

  const process = processQuery.data ?? null;
  const eligibleEmployees = eligibleQuery.data ?? [];
  const summaries = summariesQuery.data ?? [];
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
          <Heading size="md">Empleados Disponibles</Heading>
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
                <LuCheck /> Añadir
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root ref={summaryRef} id="resumen" variant="outline">
        <Card.Header>
          <Heading size="md">Resultados de Pre-Liquidación</Heading>
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
          ) : summaries.length === 0 ? (
            <Text color="fg.muted">Aún no se han añadido empleados a esta planilla.</Text>
          ) : (
            <Stack gap={4}>
              <HStack wrap="wrap" gap={3}>
                <Badge colorPalette="green">Empleados: {summaries.length}</Badge>
                <Badge colorPalette="blue">Ingresos: {parsePrice(summaries.reduce((sum, s) => sum + s.sueldoBruto, 0))}</Badge>
                <Badge colorPalette="orange">Egresos: {parsePrice(summaries.reduce((sum, s) => sum + s.descuentos, 0))}</Badge>
                <Badge colorPalette="purple">Neto: {parsePrice(summaries.reduce((sum, s) => sum + s.sueldoNeto, 0))}</Badge>
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
                    {summaries.map((row) => (
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
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Stack>
          )}
        </Card.Body>
      </Card.Root>

      {summaries.length > 0 && (
        <HStack justify="flex-end" gap={3} flexWrap="wrap">
          <Button
            variant="outline"
            onClick={() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Resumen
          </Button>
          {isProcessOpen && (
            <Button
              colorPalette="brand"
              onClick={() => setCloseConfirmOpen(true)}
              loading={closeProcessMutation.isPending}
            >
              <LuRefreshCw /> Cerrar Planilla
            </Button>
          )}
          {isClosed && (
            <Button
              colorPalette="brand"
              onClick={() => setPayConfirmOpen(true)}
              loading={closeAndPayMutation.isPending}
            >
              <LuBanknote /> Proceder al pago
            </Button>
          )}
        </HStack>
      )}

      <EmployeePayrollDetailModal
        processId={processId}
        employeeId={modalEmployee?.id ?? 0}
        employeeName={modalEmployee?.name ?? ""}
        open={modalEmployee !== null}
        onClose={() => setModalEmployee(null)}
      />

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
                <Text fontSize="sm">¿Estás seguro de proceder al pago de esta planilla? Se generará el asiento contable correspondiente.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="surface" colorPalette="gray" onClick={() => setPayConfirmOpen(false)}>Cancelar</Button>
                <Button colorPalette="brand" loading={closeAndPayMutation.isPending} onClick={async () => {
                  try {
                    await closeAndPayMutation.mutateAsync();
                    await processQuery.refetch();
                    await summariesQuery.refetch();
                  } catch (error) {
                    const parsed = parseApiError(error as unknown);
                    toaster.create({ title: "No se pudo procesar el pago", description: parsed.message, type: "error" });
                  } finally {
                    setPayConfirmOpen(false);
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
