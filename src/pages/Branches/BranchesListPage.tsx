import { Box, Collapsible, Spinner } from "@chakra-ui/react";
import { IconButton, Input, InputGroup, Text, Button, VStack, HStack } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { HousePlusIcon, Pencil, Trash2Icon, XIcon, CheckIcon, Save, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { Branch } from "@/types/branches";
import TableSelect, { type label } from "@/components/ui/table-select";
import { useAllBranches, useCreateBranch, useEditBranch, useDeleteBranch } from "@/queries/branches.queries";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";

export default function BranchesListPage() {
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formName, setFormName] = useState("");
    const [formAddress, setFormAddress] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);

    const { data: allBranches, isPending: loadingAllBranches, isError: isErrorAllBranches, error: errorAllBranches } = useAllBranches();
    const createBranch = useCreateBranch();
    const editBranch = useEditBranch();
    const deleteBranch = useDeleteBranch();

    useEffect(() => {
        if (allBranches?.branches) {
            setBranches(allBranches.branches);
        }
    }, [allBranches]);

    useEffect(() => {
        if (isErrorAllBranches) {
            toaster.create({
                title: "Error al traer las sucursales",
                description: errorAllBranches?.message,
                type: "error"
            });
        }
    }, [isErrorAllBranches, errorAllBranches]);

    const labels: label<Branch>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a: Branch, b: Branch) => a.id - b.id },
        { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a: Branch, b: Branch) => a.name.localeCompare(b.name) },
        { labelName: "Dirección", propName: "address" }
    ];

    const handleNewBranch = () => {
        setFormName("");
        setFormAddress("");
        setIsEditing(false);
        setEditingBranch(null);
        setShowForm(true);
    };

    const handleEditBranch = () => {
        if (!selectedBranch) return;
        setFormName(selectedBranch.name);
        setFormAddress(selectedBranch.address);
        setIsEditing(true);
        setEditingBranch({ ...selectedBranch });
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setFormName("");
        setFormAddress("");
        setIsEditing(false);
        setEditingBranch(null);
    };

    const handleSubmitForm = async () => {
        if (!formName.trim()) {
            toaster.create({
                title: "Error",
                description: "El nombre es requerido",
                type: "error"
            });
            return;
        }

        try {
            if (isEditing && editingBranch) {
                await editBranch.mutateAsync({
                    id: editingBranch.id,
                    data: { name: formName, address: formAddress }
                });
                toaster.create({
                    title: "Éxito",
                    description: `${formName} fue actualizada`,
                    type: "success"
                });
            } else {
                await createBranch.mutateAsync({ name: formName, address: formAddress });
                toaster.create({
                    title: "Éxito",
                    description: `${formName} fue creada`,
                    type: "success"
                });
            }
            setShowForm(false);
            setFormName("");
            setFormAddress("");
            setIsEditing(false);
            setEditingBranch(null);
            setSelectedBranch(null)
        } catch (error) {
            toaster.create({
                title: "Error",
                description: isEditing ? "No se pudo actualizar" : "No se pudo crear",
                type: "error"
            });
        }
    };

    const handleDeleteBranch = async () => {
        if (!selectedBranch) return;

        try {
            await deleteBranch.mutateAsync(selectedBranch.id);
            setSelectedBranch(null);
            toaster.create({
                title: "Éxito",
                description: `${selectedBranch.name} fue eliminada`,
                type: "success"
            });
        } catch (error) {
            toaster.create({
                title: "Error",
                description: "No se pudo eliminar la sucursal",
                type: "error"
            });
        }
    };

    const isPending = createBranch.isPending || editBranch.isPending || deleteBranch.isPending;

    return (
        <Box padding={5} display="flex" flexDirection="column" gap={4}>
            <Box display="flex" flexDirection="row" gap={5} alignContent="center" justifyContent="space-between">
                <Text fontWeight="bold" fontSize="3xl">Listado de sucursales</Text>  <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    {/* <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar sucursales por nombre o dirección" />
                </InputGroup> */}

                    <DestructiveActionDialog title={"Eliminar Sucursal"}
                        description="Una vez eliminada la sucursal, la acción es irreversible"
                        onAccept={handleDeleteBranch}
                        trigger={<IconButton
                            paddingX={5}
                            colorPalette="red"
                            variant="solid"
                            disabled={!selectedBranch || isPending}
                        >
                            {deleteBranch.isPending ? <Spinner /> : <Trash2Icon size={20} />}
                            Eliminar
                        </IconButton>} />
                    <IconButton
                        paddingX={5}
                        bgColor="brand.secondary"
                        disabled={!selectedBranch}
                        onClick={handleEditBranch}
                    >
                        <Pencil size={20} />
                        Editar
                    </IconButton>

                    <IconButton
                        paddingX={5}
                        bgColor="brand.primary"
                        onClick={handleNewBranch}
                    >
                        <HousePlusIcon size={20} />
                        Nueva
                    </IconButton>
                </Box></Box>

            <Collapsible.Root open={showForm} onOpenChange={(e) => setShowForm(e.open)}>
                <Collapsible.Content>
                    <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" mb={4}>
                        <VStack gap={3} align="stretch">
                            <Text fontWeight="bold" fontSize="lg">
                                {isEditing ? "Editar Sucursal" : "Nueva Sucursal"}
                            </Text>

                            <Box>
                                <Text mb={1} fontSize="sm" fontWeight="medium">Nombre</Text>
                                <Input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ingrese el nombre"
                                    autoFocus
                                />
                            </Box>

                            <Box>
                                <Text mb={1} fontSize="sm" fontWeight="medium">Dirección</Text>
                                <Input
                                    value={formAddress}
                                    onChange={(e) => setFormAddress(e.target.value)}
                                    placeholder="Ingrese la dirección"
                                />
                            </Box>

                            <HStack gap={2} justifyContent="flex-end">
                                <Button onClick={handleCancelForm} variant="outline" colorPalette="gray" disabled={isPending}>
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmitForm}
                                    bg="brand.primary"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Spinner size="sm" color="white" />
                                    ) : (
                                        isEditing ? <Save/>:<Plus/> 
                                    )}
                                    {isEditing ? "Guardar" : "Crear"}
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Collapsible.Content>
            </Collapsible.Root>


            <TableSelect
                key={JSON.stringify(branches)}
                data={branches}
                loading={loadingAllBranches}
                labels={labels}
                loadingMessage="Cargando sucursales..."
                height="auto"
                noItemsComponent={
                    <EmptyDataScreen
                        title="No hay sucursales registradas"
                        message="Registra nuevas sucursales para verlas en esta lista."
                    />
                }
                onSelect={(item: Branch | null) => { setSelectedBranch(item); }}
                onDoubleClick={(item: Branch) => console.log("se hizo dobleclic en ", item)}
            />
        </Box>
    );
}