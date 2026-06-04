import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuPrinter } from "react-icons/lu";
import { payrollProcessesApi, type PayrollEmployeeReceiptDto } from "@/api/payroll-processes.api";
import { parsePrice } from "@/constants/price";
import { parseApiError } from "@/utils/api-error";
import { toaster } from "@/components/ui/toaster";
import PayrollReceipt from "./PayrollReceipt";

interface EmployeePayrollDetailModalProps {
  processId: number;
  employeeId: number;
  employeeName: string;
  open: boolean;
  onClose: () => void;
}

export default function EmployeePayrollDetailModal({
  processId,
  employeeId,
  employeeName,
  open,
  onClose,
}: EmployeePayrollDetailModalProps) {
  const [receipt, setReceipt] = useState<PayrollEmployeeReceiptDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (!open) {
      setReceipt(null);
      setShowReceipt(false);
      return;
    }

    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const data = await payrollProcessesApi.getEmployeeReceipt(processId, employeeId);
        setReceipt(data);
      } catch (error) {
        const parsed = parseApiError(error as unknown);
        toaster.create({
          title: "No se pudieron obtener los datos del recibo",
          description: parsed.message,
          type: "error",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [open, processId, employeeId, onClose]);

  if (showReceipt && receipt) {
    return (
      <PayrollReceipt
        receipt={receipt}
        onClose={() => setShowReceipt(false)}
      />
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onClose(); }} size="xl">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
          <Dialog.Content maxHeight="90vh">
            <Dialog.Header display="flex" alignItems="center" gap={2}>
              <Dialog.Title fontSize="lg" fontWeight="semibold">
                Detalle de Liquidación
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body pb={4} overflowY="auto">
              {loading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                  <Text mt={4}>Cargando detalle...</Text>
                </Box>
              ) : receipt ? (
                <Stack gap={4}>
                  <Box borderWidth="1px" rounded="md" p={3} bg="gray.50">
                    <Text fontWeight="bold" fontSize="md" mb={2}>Datos del Empleado</Text>
                    <Stack gap={1} fontSize="sm">
                      <HStack justify="space-between">
                        <Text color="gray.600">Nombre:</Text>
                        <Text fontWeight="medium">{receipt.employeeName}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Legajo:</Text>
                        <Text fontWeight="medium">{receipt.employeeLegajo}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Documento:</Text>
                        <Text fontWeight="medium">{receipt.employeeDocument}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Cargo:</Text>
                        <Text fontWeight="medium">{receipt.positionName}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Sucursal:</Text>
                        <Text fontWeight="medium">{receipt.branchName || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Período:</Text>
                        <Text fontWeight="medium">{receipt.period}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Fecha de Pago:</Text>
                        <Text fontWeight="medium">{receipt.payDate || "-"}</Text>
                      </HStack>
                    </Stack>
                  </Box>

                  {receipt.earnings.filter((e) => e.amount !== 0).length > 0 && (
                    <Box>
                      <Text fontWeight="bold" fontSize="md" mb={2} color="green.700">Haberes</Text>
                      <Table.ScrollArea borderWidth="1px" rounded="md">
                        <Table.Root size="sm">
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                              <Table.ColumnHeader textAlign="end">Monto</Table.ColumnHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {receipt.earnings.filter((e) => e.amount !== 0).map((e, i) => (
                              <Table.Row key={i}>
                                <Table.Cell>{e.conceptName}</Table.Cell>
                                <Table.Cell textAlign="end" fontFamily="mono">{parsePrice(e.amount)}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      </Table.ScrollArea>
                    </Box>
                  )}

                  {receipt.deductions.filter((d) => d.amount !== 0).length > 0 && (
                    <Box>
                      <Text fontWeight="bold" fontSize="md" mb={2} color="red.700">Descuentos</Text>
                      <Table.ScrollArea borderWidth="1px" rounded="md">
                        <Table.Root size="sm">
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                              <Table.ColumnHeader textAlign="end">Monto</Table.ColumnHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {receipt.deductions.filter((d) => d.amount !== 0).map((d, i) => (
                              <Table.Row key={i}>
                                <Table.Cell>{d.conceptName}</Table.Cell>
                                <Table.Cell textAlign="end" fontFamily="mono">{parsePrice(d.amount)}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      </Table.ScrollArea>
                    </Box>
                  )}

                  <Box borderWidth="1px" rounded="md" p={3} bg="gray.50">
                    <Stack gap={1} fontSize="sm">
                      <HStack justify="space-between">
                        <Text color="gray.600">Total Haberes:</Text>
                        <Text fontWeight="bold" fontFamily="mono">{parsePrice(receipt.totalEarnings)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Total Descuentos:</Text>
                        <Text fontWeight="bold" fontFamily="mono">{parsePrice(receipt.totalDeductions)}</Text>
                      </HStack>
                      <HStack justify="space-between" borderTopWidth="1px" pt={1} mt={1}>
                        <Text fontWeight="bold" fontSize="md">Sueldo Neto:</Text>
                        <Text fontWeight="bold" fontSize="md" fontFamily="mono" color="green.700">{parsePrice(receipt.netSalary)}</Text>
                      </HStack>
                    </Stack>
                  </Box>
                </Stack>
              ) : null}
            </Dialog.Body>
            <Dialog.Footer display="flex" justifyContent="space-between">
              <Dialog.ActionTrigger asChild>
                <Button variant="surface" colorPalette="gray">Cerrar</Button>
              </Dialog.ActionTrigger>
              {receipt && (
                <Button colorPalette="brand" onClick={() => setShowReceipt(true)}>
                  <LuPrinter /> Imprimir Recibo
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
