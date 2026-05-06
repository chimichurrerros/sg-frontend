import { Box, Collapsible, Spinner, Pagination, ButtonGroup, IconButton } from "@chakra-ui/react";
import { Input, InputGroup, Text, Button, VStack, HStack, NativeSelect, Field } from "@chakra-ui/react";
import { Pencil, Trash2Icon, Plus, Save } from "lucide-react";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";
import { useEffect, useState } from "react";
import type { StockItem } from "@/types/inventory";
import TableSelect, { type label } from "@/components/ui/table-select";
import { useAllStock, useCreateStockItem, useEditStockItem, useDeleteStockItem } from "@/queries/stock.queries";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { useAllBranches } from "@/queries/branches.queries";
import { useAllProducts } from "@/queries/catalog.queries";

export default function StockListPage() {
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formProductId, setFormProductId] = useState<number>(0);
    const [formBranchId, setFormBranchId] = useState<number>(0);
    const [formQuantity, setFormQuantity] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: allStock, isPending: loadingAllStock, isError: isErrorAllStock, error: errorAllStock, refetch } = useAllStock();
    const { data: branchesData } = useAllBranches();
    const { data: productsData } = useAllProducts();
    const createItem = useCreateStockItem();
    const editItem = useEditStockItem();
    const deleteItem = useDeleteStockItem();

    useEffect(() => {
        if (isErrorAllStock) {
            toaster.create({
                title: "Error al traer el inventario",
                description: errorAllStock?.message,
                type: "error"
            });
        }
    }, [isErrorAllStock, errorAllStock]);

    const labels: label<StockItem>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
        { labelName: "Nombre Producto", propName: "productName", isSortable: true, sortFunction: (a, b) => a.productName.localeCompare(b.productName) },
        { labelName: "Nombre Sucursal", propName: "branchName", isSortable: true, sortFunction: (a, b) => a.branchName.localeCompare(b.branchName) },
        { labelName: "Cantidad", propName: "quantity", isSortable: true, sortFunction: (a, b) => a.quantity - b.quantity },
    ];

    const handleNewItem = () => {
        setFormProductId(0);
        setFormBranchId(0);
        setFormQuantity("");
        setIsEditing(false);
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEditItem = () => {
        if (!selectedItem) return;
        setFormProductId(selectedItem.productId);
        setFormBranchId(selectedItem.branchId);
        setFormQuantity(selectedItem.quantity.toString());
        setIsEditing(true);
        setEditingItem({ ...selectedItem });
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setFormProductId(0);
        setFormBranchId(0);
        setFormQuantity("");
        setIsEditing(false);
        setEditingItem(null);
    };

    const handleSubmitForm = async () => {
        if (!formProductId || formProductId === 0) {
            toaster.create({ title: "Error", description: "Seleccioná un producto", type: "error" });
            return;
        }
        if (!formBranchId || formBranchId === 0) {
            toaster.create({ title: "Error", description: "Seleccioná una sucursal", type: "error" });
            return;
        }
        if (!formQuantity || isNaN(Number(formQuantity)) || Number(formQuantity) < 0) {
            toaster.create({ title: "Error", description: "La cantidad es inválida", type: "error" });
            return;
        }

        const selectedProduct = productsData?.products.find(p => p.id === formProductId);
        const selectedBranch = branchesData?.branches.find(b => b.id === formBranchId);

        try {
            if (isEditing && editingItem) {
                await editItem.mutateAsync({
                    id: editingItem.id,
                    data: {
                        productId: formProductId,
                        productName: selectedProduct?.name ?? "",
                        branchId: formBranchId,
                        branchName: selectedBranch?.name ?? "",
                        quantity: Number(formQuantity)
                    }
                });
                toaster.create({ title: "Éxito", description: `${selectedProduct?.name} fue actualizado`, type: "success" });
            } else {
                const existingItem = allStock?.stocks.find(
                    item => item.productId === formProductId && item.branchId === formBranchId
                );

                if (existingItem) {
                    const newQuantity = existingItem.quantity + Number(formQuantity);
                    await editItem.mutateAsync({
                        id: existingItem.id,
                        data: {
                            productId: formProductId,
                            productName: selectedProduct?.name ?? "",
                            branchId: formBranchId,
                            branchName: selectedBranch?.name ?? "",
                            quantity: newQuantity
                        }
                    });
                    toaster.create({ 
                        title: "Éxito", 
                        description: `Se agregaron ${formQuantity} unidades de ${selectedProduct?.name}`, 
                        type: "success" 
                    });
                } else {
                    await createItem.mutateAsync({
                        productId: formProductId,
                        productName: selectedProduct?.name ?? "",
                        branchId: formBranchId,
                        branchName: selectedBranch?.name ?? "",
                        quantity: Number(formQuantity)
                    });
                    toaster.create({ title: "Éxito", description: `${selectedProduct?.name} fue creado`, type: "success" });
                }
            }
            
            setShowForm(false);
            setFormProductId(0);
            setFormBranchId(0);
            setFormQuantity("");
            setIsEditing(false);
            setEditingItem(null);
            setSelectedItem(null);
            refetch();
        } catch (error) {
            console.error("Error:", error);
            toaster.create({ title: "Error", description: isEditing ? "No se pudo actualizar" : "No se pudo crear", type: "error" });
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        try {
            await deleteItem.mutateAsync(selectedItem.id);
            setSelectedItem(null);
            toaster.create({ title: "Éxito", description: `${selectedItem.productName} fue eliminado`, type: "success" });
            refetch();
        } catch {
            toaster.create({ title: "Error", description: "No se pudo eliminar el producto", type: "error" });
        }
    };

    const isPending = createItem.isPending || editItem.isPending || deleteItem.isPending;

    const stocks = allStock?.stocks ?? [];
    const filteredStocks = stocks.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branchName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedStocks = filteredStocks.slice((page - 1) * pageSize, page * pageSize);

    return (
        <Box padding={5} display="flex" flexDirection="column" gap={4}>
            <Text fontWeight="bold" fontSize="3xl">Listado de Productos en Inventario</Text>

            <Box display="flex" flexDirection="row" gap={3} alignItems="center" justifyContent="space-between">
                <InputGroup flex="1" maxW="400px" startElement={<LuSearch />}>
                    <Input
                        placeholder="Buscar por nombre del producto o sucursal"
                        value={searchTerm}
                        variant="subtle"
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </InputGroup>

                <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                    <DestructiveActionDialog
                        title="Eliminar Producto"
                        description="Una vez eliminado el producto, la acción es irreversible"
                        onAccept={handleDeleteItem}
                        trigger={
                            <Button variant="outline" disabled={!selectedItem || isPending}>
                                {deleteItem.isPending ? <Spinner /> : <Trash2Icon size={16} />}
                                Eliminar
                            </Button>
                        }
                    />
                    <Button variant="outline" disabled={!selectedItem} onClick={handleEditItem}>
                        <Pencil size={16} />
                        Editar
                    </Button>
                    <Button bgColor="brand.primary" onClick={handleNewItem}>
                        <Plus size={16} />
                        Nuevo
                    </Button>
                </Box>
            </Box>

            <Collapsible.Root open={showForm} onOpenChange={(e) => setShowForm(e.open)}>
                <Collapsible.Content>
                    <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" mb={4}>
                        <VStack gap={3} align="stretch">
                            <Text fontWeight="bold" fontSize="lg">
                                {isEditing ? "Editar Item" : "Nuevo Item"}
                            </Text>

                            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3}>
                                <Field.Root required>
                                    <Field.Label>Producto</Field.Label>
                                    <NativeSelect.Root disabled={isPending}>
                                        <NativeSelect.Field
                                            value={formProductId}
                                            onChange={(e) => setFormProductId(Number(e.target.value))}
                                        >
                                            <option value={0}>Seleccionar producto</option>
                                            {productsData?.products.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label>Sucursal</Field.Label>
                                    <NativeSelect.Root disabled={isPending}>
                                        <NativeSelect.Field
                                            value={formBranchId}
                                            onChange={(e) => setFormBranchId(Number(e.target.value))}
                                        >
                                            <option value={0}>Seleccionar sucursal</option>
                                            {branchesData?.branches.map((b) => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label>Cantidad</Field.Label>
                                    <Input
                                        value={formQuantity}
                                        onChange={(e) => setFormQuantity(e.target.value)}
                                        placeholder="0"
                                        type="number"
                                        min="0"
                                        disabled={isPending}
                                    />
                                </Field.Root>
                            </Box>

                            <HStack gap={2} justifyContent="flex-end">
                                <Button onClick={handleCancelForm} variant="outline" colorPalette="gray" disabled={isPending}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmitForm} bgColor="brand.primary" disabled={isPending}>
                                    {isPending ? <Spinner size="sm" color="white" /> : isEditing ? <Save /> : <Plus />}
                                    {isEditing ? "Guardar" : "Crear"}
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Collapsible.Content>
            </Collapsible.Root>

            <TableSelect
                key={String(searchTerm + page)} 
                data={paginatedStocks}
                height="400px"
                loading={loadingAllStock}
                labels={labels}
                loadingMessage="Cargando inventario..."
                noItemsComponent={
                    <EmptyDataScreen
                        title="No hay productos en inventario"
                        message="Registra nuevos productos para verlos en esta lista."
                    />
                }
                onSelect={(item: StockItem | null) => setSelectedItem(item)}
                onDoubleClick={(item: StockItem) => console.log("doble clic en", item)}
            />

            <Pagination.Root
                count={filteredStocks.length ?? 0}
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
                        render={(page) => (
                            <IconButton
                                variant={{ base: "outline", _selected: "solid" }}
                                zIndex={{ _selected: "1" }}
                                _selected={{ bg: "brand.primary", color: "white" }}
                            >
                                {page.value}
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
        </Box>
    );
}