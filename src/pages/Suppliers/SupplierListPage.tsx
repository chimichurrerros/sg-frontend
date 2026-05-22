import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { Supplier } from "@/types/suppliers";
import {
    suppliersKeys,
    useAllSuppliers,
    useEditSupplier,
} from "@/queries/suppliers.queries";
import TableBar from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { Box, ButtonGroup, IconButton, Input, InputGroup, Pagination, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";

export default function SupplierListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading } = useAllSuppliers();
    const editSupplier = useEditSupplier();
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const suppliers = (data?.suppliers ?? []).filter(s => s.isActive);
    const filteredSuppliers = suppliers.filter((supplier) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
            supplier.businessName.toLowerCase().includes(term) ||
            (supplier.phone ?? "").toLowerCase().includes(term)
        );
    });
    const pageSize = 10;
    const currentSuppliers = filteredSuppliers.slice((page - 1) * pageSize, page * pageSize);

    const labels: label<Supplier>[] = [
        {
            labelName: "Nombre",
            propName: "businessName",
            isSortable: true,
            sortFunction: (a, b) => a.businessName.localeCompare(b.businessName),
        },
        { labelName: "Teléfono", propName: "phone", textIfNull: "-" },
        {
            labelName: "Activo",
            isComponent: true,
            render: (item) => (item.isActive ? "Sí" : "No"),
            isSortable: true,
            sortFunction: (a, b) => Number(b.isActive) - Number(a.isActive),
        },
    ];

    const handleCreate = () => {
        navigate("/dash/proveedores/nuevo");
    };

    const handleEdit = () => {
        if (!selectedSupplier) return;
        navigate(`/dash/proveedores/${selectedSupplier.id}`);
    };

    const handleDelete = () => {
        if (!selectedSupplier) return;

        editSupplier.mutate(
            { id: selectedSupplier.id, data: { isActive: false } },
            {
                onSuccess: () => {
                    toaster.create({ title: "Proveedor eliminado con éxito" });
                    queryClient.invalidateQueries({ queryKey: suppliersKeys.suppliers });
                    setSelectedSupplier(null);
                },
                onError: (error: unknown) => {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : typeof error === "string"
                            ? error
                            : "Error desconocido";
                    toaster.create({
                        title: "Error al eliminar proveedor",
                        description: errorMessage,
                        type: "error",
                    });
                },
            }
        );
    };

    return (
        <Stack gap={4} p={4}>
            <Text fontSize="3xl" fontWeight="bold">
                Proveedores
            </Text>

            <Box display="flex" flexDirection="row" gap={3} alignItems="center" justifyContent="space-between">
                <InputGroup flex="1" maxW="400px" startElement={<LuSearch />}>
                    <Input
                        placeholder="Buscar por nombre"
                        value={searchTerm}
                        variant="subtle"
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </InputGroup>

                <TableBar
                    selected={selectedSupplier}
                    onCreate={handleCreate}
                    onEdit={selectedSupplier ? handleEdit : undefined}
                    onDelete={handleDelete}
                />
            </Box>

            <TableSelect
                data={currentSuppliers}
                labels={labels}
                loading={isLoading}
                noItemsComponent={
                    <EmptyDataScreen
                        title="No hay proveedores"
                        message="Crea un proveedor para verlo en la lista."
                    />
                }
                onSelect={(item) => setSelectedSupplier(item)}
                onDoubleClick={(item) => navigate(`/dash/proveedores/${item.id}`)}
            />

            <Pagination.Root
                count={filteredSuppliers.length ?? 0}
                pageSize={pageSize}
                page={page}
                onPageChange={(e) => setPage(e.page)}
                display="flex"
                justifyContent="center"
            >
                <ButtonGroup attached variant="outline" size="sm">
                    <Pagination.PrevTrigger asChild>
                        <IconButton>
                            <LuChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>
                    <Pagination.Items
                        render={(pageItem) => (
                            <IconButton
                                variant={{ base: "outline", _selected: "solid" }}
                                zIndex={{ _selected: "1" }}
                                _selected={{ bg: "brand.primary", color: "white" }}
                            >
                                {pageItem.value}
                            </IconButton>
                        )}
                    />
                    <Pagination.NextTrigger asChild>
                        <IconButton>
                            <LuChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
        </Stack>
    );
}