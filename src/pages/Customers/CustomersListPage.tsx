import type { Customer, CustomerRequest } from "@/api/customers.api";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useCreateCustomer, useEditCustomer, useGetCustomers } from "@/queries/customers.queries";
import type { PaginationParams } from "@/types/types";
import { Box, Button, Collapsible, Flex, Input, InputGroup, Spacer, Spinner, Stack, Text } from "@chakra-ui/react";
import { BeanOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch, LuPencil, LuPlus, LuX, LuCheck } from "react-icons/lu";
import { isValidRuc } from "../Sales/SaleSheetPage";
import { parseDate } from "@/constants/date";
import { DatePickerWrapper } from "@/components/ui/date-picker-wrapper";

type FormMode = "create" | "edit" | null;

const emptyForm: CustomerRequest = { name: "", ruc: "", email: "", birthDate: "" };

export const CustomersListPage = () => {
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const { data: customers, isLoading, error, isError } = useGetCustomers(params);
    const [selected, setSelected] = useState<Customer | null>(null);
    const [formMode, setFormMode] = useState<FormMode>(null);
    const [formData, setFormData] = useState<CustomerRequest>(emptyForm);
    const editCustomer = useEditCustomer();
    const createCustomer = useCreateCustomer();
    const labels: label<Customer>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
        { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a, b) => a.name.localeCompare(b.name) },
        { labelName: "RUC", propName: "ruc", isSortable: true, sortFunction: (a, b) => a.ruc.localeCompare(b.ruc) },
        {labelName: "Email", propName: "email", isSortable: true, sortFunction: (a, b) => (a.email || "").localeCompare(b.email || "")},
        {labelName: "Fecha de Nacimiento", propName: "birthDate", isSortable: true,transformFunction:(value)=>parseDate(value), sortFunction: (a, b) => new Date(a.birthDate || "").getTime() - new Date(b.birthDate || "").getTime()},
    ];

    useEffect(() => {
        if (isError) { toaster.create({ title: "Error al cargar los clientes", description: error?.message || "Error desconocido", type: "error" }) }
    }, [error, isError]);


    const handleOpenCreate = () => {
        setFormData(emptyForm);
        setFormMode("create");
    };

    const handleOpenEdit = () => {
        if (!selected) return;
        setFormData({ name: selected.name, ruc: selected.ruc, email: selected.email, birthDate: selected.birthDate });
        setFormMode("edit");
    };

    const handleCancel = () => {
        setFormMode(null);
        setFormData(emptyForm);
        setSelected(null);
    };

    const handleConfirm = () => {
        if (formMode === "create") {
            createCustomer.mutate(formData, {
                onSuccess: () => {
                    toaster.create({ title: "Cliente creado exitosamente", type: "success" });
                    handleCancel();
                },
                onError: (error: any) => {
                    const errorMessage = error.response?.data?.title || error.message || "Error desconocido";
                    toaster.create({ title: "Error al crear el cliente: " + errorMessage, type: "error" });
                }
            });
        }
        if (formMode === "edit" && selected) {
            editCustomer.mutate({ id: selected!.id, body: formData }, {
                onSuccess: () => {
                    toaster.create({ title: "Cliente editado exitosamente", type: "success" });
                    handleCancel();
                },
                onError: (error: any) => {
                    const errorMessage = error.response?.data?.title || error.message || "Error desconocido";
                    toaster.create({ title: "Error al editar el cliente: " + errorMessage, type: "error" });
                }
            });
        }
    };

    return (
        <Stack>
            <Text fontWeight="bold" fontSize="3xl">Clientes registrados</Text>
            <Flex gap="0.8rem">
                <InputGroup startElement={<LuSearch />} maxW="32rem">
                    <Input placeholder="Buscar" variant="subtle" />
                </InputGroup>
                <Spacer />
                <Button size="sm" variant="outline" colorPalette="brand" disabled={selected === null} onClick={handleOpenEdit}>
                    <LuPencil /> Editar
                </Button>
                <Button size="sm" colorPalette="brand" onClick={handleOpenCreate}>
                    <LuPlus /> Nuevo
                </Button>
            </Flex>
            {/* Card de formulario */}
            {formMode !== null && (
                <Collapsible.Root open={formMode !== null} onOpenChange={(e) => { if (!e.open) handleCancel(); }}>
                    <Collapsible.Content>
                        <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" mb={4}>
                            <Text fontWeight="bold" fontSize="md" mb={3}>
                                {formMode === "create" ? "Nuevo Cliente" : `Editando: ${selected?.name}`}
                            </Text>
                            <Flex gap={3} align="flex-end">
                                <Box flex={2}>
                                    <Text fontSize="xs" color="gray.500" mb={1}>Nombre / Razón Social</Text>
                                    <Input
                                        size="md"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nombre del cliente"
                                    />
                                </Box>
                                <Box flex={1}>
                                    <Text fontSize="xs" color="gray.500" mb={1}>RUC</Text>
                                    <Input
                                        size="md"
                                        placeholder="RUC del cliente"
                                        value={formData.ruc}
                                        maxLength={9}
                                        onChange={(e) => {
                                            const clean = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
                                            const formatted = clean.length > 1
                                                ? clean.slice(0, -1) + "-" + clean.slice(-1)
                                                : clean;
                                            setFormData({ ...formData, ruc: formatted });
                                        }}
                                    />
                                </Box>
                                <Box flex={2}>
                                    <Text fontSize="xs" color="gray.500" mb={1}>Email</Text>
                                    <Input
                                        size="md"
                                        placeholder="Email del cliente"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Box>
                                <Box flex={2}>
                                    <Text fontSize="xs" color="gray.500" mb={1}>Fecha de Nacimiento</Text>
                                    <DatePickerWrapper
                                        value={formData.birthDate}
                                        onChange={(date) => setFormData({ ...formData, birthDate: date[0] })}
                                    />
                                    {/* <Input
                                        size="sm"
                                        type="date"
                                        placeholder="Fecha de nacimiento"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    /> */}
                                </Box>
                                <Button size="sm" colorPalette="brand" onClick={handleConfirm} disabled={!formData.name || !isValidRuc(formData.ruc || "") || createCustomer.isPending || editCustomer.isPending }>
                                    {createCustomer.isPending || editCustomer.isPending ? <Spinner /> : <LuCheck />} Confirmar
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                    <LuX /> Cancelar
                                </Button>
                            </Flex>
                        </Box>
                    </Collapsible.Content>
                </Collapsible.Root>
            )}

            <TableSelect
                key={JSON.stringify(customers?.customers)} 
                data={customers?.customers ?? []}
                labels={labels}
                onSelect={(item) => setSelected(item)}
                loading={isLoading}
                noItemsComponent={<EmptyDataScreen title="No se cargaron clientes" message="Verificar errores de conexión o crear un cliente nuevo" icon={<BeanOffIcon />} />}
            />

            <PaginationControl
                pagination={customers?.pagination || null}
                onPageChange={(page) => setParams({ ...params, page })} />
        </Stack>
    );
};