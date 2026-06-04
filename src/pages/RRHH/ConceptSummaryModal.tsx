import { Box, Button, CloseButton, Dialog, HStack, Portal, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { useGetPayrollConceptSummaries } from "@/queries/payroll-processes.queries";
import { parsePrice } from "@/constants/price";

interface ConceptSummaryModalProps {
  processId: number;
  open: boolean;
  onClose: () => void;
}

export default function ConceptSummaryModal({ processId, open, onClose }: ConceptSummaryModalProps) {
  const { data: summaries, isPending } = useGetPayrollConceptSummaries(open ? processId : undefined);

  const earnings = summaries?.find((s) => s.payrollType === "Ingresos")?.concepts ?? [];
  const deductions = summaries?.find((s) => s.payrollType === "Egresos")?.concepts ?? [];

  const totalEarnings = earnings.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalDeductions = deductions.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalNet = totalEarnings - totalDeductions;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onClose(); }} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
          <Dialog.Content maxHeight="90vh">
            <Dialog.Header display="flex" alignItems="center" gap={2}>
              <Dialog.Title fontSize="lg" fontWeight="semibold">
                Resumen de Novedades
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body pb={4} overflowY="auto">
              {isPending ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                  <Text mt={4}>Cargando resumen...</Text>
                </Box>
              ) : (
                <Stack gap={5}>
                  {earnings.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" fontSize="md" mb={2} color="green.700">Ingresos</Text>
                      <Table.Root size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {earnings.map((c, i) => (
                            <Table.Row key={i}>
                              <Table.Cell>{c.conceptName}</Table.Cell>
                              <Table.Cell textAlign="end" fontFamily="mono">{parsePrice(c.totalAmount)}</Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Box>
                  )}

                  {deductions.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" fontSize="md" mb={2} color="red.700">Egresos</Text>
                      <Table.Root size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {deductions.map((c, i) => (
                            <Table.Row key={i}>
                              <Table.Cell>{c.conceptName}</Table.Cell>
                              <Table.Cell textAlign="end" fontFamily="mono">{parsePrice(c.totalAmount)}</Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Box>
                  )}

                  <Box borderWidth="1px" rounded="md" p={3} bg="gray.50">
                    <Stack gap={1} fontSize="sm">
                      <HStack justify="space-between">
                        <Text color="gray.600">Total Ingresos:</Text>
                        <Text fontWeight="bold" fontFamily="mono">{parsePrice(totalEarnings)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Total Egresos:</Text>
                        <Text fontWeight="bold" fontFamily="mono">{parsePrice(totalDeductions)}</Text>
                      </HStack>
                      <HStack justify="space-between" borderTopWidth="1px" pt={1} mt={1}>
                        <Text fontWeight="bold" fontSize="md">Total a Pagar:</Text>
                        <Text fontWeight="bold" fontSize="md" fontFamily="mono" color="green.700">{parsePrice(totalNet)}</Text>
                      </HStack>
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Dialog.Body>
            <Dialog.Footer display="flex" justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button variant="surface" colorPalette="gray">Cerrar</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
