import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { Supplier } from "@/types/suppliers";
import {
    suppliersKeys,
    useAllSuppliers,
    useEditSupplier,
} from "@/queries/suppliers.queries";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import { Box, IconButton, Input, InputGroup, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuSearch, LuPencil, LuTrash2, LuPlus } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import type { PaginationParams } from "@/types/types";

export default function SupplierListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const { data, isLoading } = useAllSuppliers();
    const editSupplier = useEditSupplier();

    const suppliers = (data?.suppliers ?? []).filter(s => s.isActive);

    const pagination = {
        currentPage: params.page,
        pageSize: params.pageSize,
        totalElements: suppliers.length,
        totalPages: Math.ceil(suppliers.length / params.pageSize),
    };

    const labels: label<Supplier>[] = [
        {
            labelName: "Nombre",
            propName: "businessName",
            isSortable: true,
            sortFunction: (a, b) => a.businessName.localeCompare(b.businessName),
        },
        { labelName: "RUC", propName: "ruc", textIfNull: "-" },
        { labelName: "Teléfono", propName: "phone", textIfNull: "-" },
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
            { id: selectedSupplier.id, data: {
                 isActive: false,
                 ruc: selectedSupplier.ruc,
                 businessName: selectedSupplier.businessName, 
                } },
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

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar Proveedores..." />
                </InputGroup>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <IconButton
                    padding={2}
                    variant="outline"
                    colorPalette="brand"
                    disabled={!selectedSupplier}
                    onClick={handleDelete}
                >
                    <LuTrash2 />
                    Eliminar
                </IconButton>
                <IconButton
                    padding={2}
                    variant="outline"
                    colorPalette="brand"
                    disabled={!selectedSupplier}
                    onClick={handleEdit}
                >
                    <LuPencil />
                    Editar
                </IconButton>
                <IconButton
                    padding={2}
                    colorPalette="brand"
                    onClick={handleCreate}
                >
                    <LuPlus />
                    Nuevo
                </IconButton>
            </Box>

            <TableSelect
                data={suppliers.slice((params.page - 1) * params.pageSize, params.page * params.pageSize)}
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

            <PaginationControl
                pagination={pagination}
                onPageChange={(page: number) => { setParams({ ...params, page }) }}
            />
        </Stack>
    );
}