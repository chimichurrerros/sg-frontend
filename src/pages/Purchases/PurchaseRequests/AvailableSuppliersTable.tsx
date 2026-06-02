import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Portal } from "@chakra-ui/react/portal";
import { Box, Checkbox, Table } from "@chakra-ui/react";
import { useEligibleSuppliers } from "@/queries/purchase-request.queries";
import { useState } from "react";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { FileQuestion } from "lucide-react";
import type { EligibleSupplier } from "@/api/purchaseRequest.api";

interface AvailableSuppliersTableProps {
  trigger?: React.ReactNode;
  productIds: number[];
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[]) => void;
}

export default function AvailableSuppliersTable({
  trigger,
  productIds,
  initialSelectedIds = [],
  onConfirm,
}: AvailableSuppliersTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(initialSelectedIds),
  );

  const {
    data: eligibleSuppliers,
    isPending,
    isError,
    error,
  } = useEligibleSuppliers(productIds, open);

  const handleCheckedChange = (supplierId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(supplierId);
      } else {
        next.delete(supplierId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (!eligibleSuppliers) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        eligibleSuppliers.forEach((s) => next.add(s.supplierId));
      } else {
        eligibleSuppliers.forEach((s) => next.delete(s.supplierId));
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
  };

  const allSelected = eligibleSuppliers?.length
    ? eligibleSuppliers.every((s) => selectedIds.has(s.supplierId))
    : false;

  const someSelected = eligibleSuppliers?.length
    ? eligibleSuppliers.some((s) => selectedIds.has(s.supplierId))
    : false;

  const selectAllChecked = allSelected
    ? true
    : someSelected
      ? "indeterminate"
      : false;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (e.open) {
          setSelectedIds(new Set(initialSelectedIds));
        }
      }}
    >
      <Dialog.Trigger asChild>
        {trigger || <Button variant="outline">Seleccionar Proveedores</Button>}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Dialog.Content width="700px" maxWidth="95%">
            <Dialog.Header>
              <Dialog.Title fontSize="lg" fontWeight="semibold">
                Proveedores Elegibles
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={4}>
              {isPending ? (
                <LoadingScreen
                  minHeight="300px"
                  message="Cargando proveedores elegibles..."
                />
              ) : isError ? (
                <ErrorScreen
                  title="Error al cargar proveedores"
                  errorMessage={
                    error?.message ||
                    "No se pudieron cargar los proveedores elegibles"
                  }
                />
              ) : !eligibleSuppliers || eligibleSuppliers.length === 0 ? (
                <EmptyDataScreen
                  title="Sin proveedores elegibles"
                  icon={<FileQuestion />}
                  message="No se encontraron proveedores que puedan proveer los productos seleccionados"
                />
              ) : (
                <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                  <Table.Root size="sm" stickyHeader>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader width="48px">
                          <Checkbox.Root
                            checked={selectAllChecked}
                            onCheckedChange={(e) =>
                              handleSelectAll(e.checked === true)
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Razón Social</Table.ColumnHeader>
                        <Table.ColumnHeader>Nombre Fantasía</Table.ColumnHeader>
                        <Table.ColumnHeader>Categorías</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {eligibleSuppliers.map((supplier: EligibleSupplier) => (
                        <Table.Row key={supplier.supplierId}>
                          <Table.Cell>
                            <Checkbox.Root
                              checked={selectedIds.has(supplier.supplierId)}
                              onCheckedChange={(e) =>
                                handleCheckedChange(
                                  supplier.supplierId,
                                  e.checked === true,
                                )
                              }
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                            </Checkbox.Root>
                          </Table.Cell>
                          <Table.Cell>{supplier.businessName}</Table.Cell>
                          <Table.Cell>{supplier.fantasyName || "—"}</Table.Cell>
                          <Table.Cell>
                            {supplier.categoryNames?.join(", ") || "—"}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer display="flex" justifyContent="flex-end" gap={2}>
              <Dialog.ActionTrigger asChild>
                <Button variant="surface" colorPalette="gray">
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="surface"
                  colorPalette="brand"
                  disabled={
                    !eligibleSuppliers || eligibleSuppliers.length === 0
                  }
                  onClick={handleConfirm}
                >
                  Seleccionar ({selectedIds.size})
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
