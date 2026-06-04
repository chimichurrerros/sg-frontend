import { Box, Collapsible, Spinner, Button, VStack, HStack, Field, RadioGroup, Select, Portal, createListCollection } from "@chakra-ui/react";
import { Input, InputGroup, Text } from "@chakra-ui/react";
import { Pencil, Trash2Icon, Plus, Save } from "lucide-react";
import { LuSearch } from "react-icons/lu";
import { useEffect, useMemo, useState } from "react";
import type { StockItem } from "@/types/inventory";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { useAllStock, useCreateStockItem, useEditStockItem, useDeleteStockItem } from "@/queries/stock.queries";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { useAllBranches } from "@/queries/branches.queries";
import { useAllProducts, useAllServices } from "@/queries/catalog.queries";
import PaginationControl from "@/components/ui/pagination-control";
import PageSizeControl from "@/components/ui/page-size-control";
import type { PaginationParams } from "@/types/types";
import { IconButton } from "@chakra-ui/react";
import PageTitle from "@/components/ui/title";

export default function StockListPage() {
    const [params, setParams] = useState<PaginationParams>({ page: 1, pageSize: 10 });
    const [filterBranchId, setFilterBranchId] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [itemType, setItemType] = useState<"product" | "service">("product");
    const [formProductId, setFormProductId] = useState<number>(0);
    const [formBranchId, setFormBranchId] = useState<number>(0);
    const [formQuantity, setFormQuantity] = useState("");

    const { data: allStock, isPending: loadingAllStock, isError: isErrorAllStock, error: errorAllStock, refetch } = useAllStock();
    const { data: branchesData } = useAllBranches();
    const { data: productsData } = useAllProducts();
    const { data: servicesData } = useAllServices();
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

    const serviceIds = new Set((servicesData?.services ?? []).map((s) => s.id));

    const productCollection = useMemo(
        () => createListCollection({
            items: (productsData?.products ?? []).map((p) => ({
                label: p.name ?? "Sin nombre",
                value: String(p.id),
            })),
        }),
        [productsData],
    );

    const serviceCollection = useMemo(
        () => createListCollection({
            items: (servicesData?.services ?? []).map((s) => ({
                label: s.name,
                value: String(s.id),
            })),
        }),
        [servicesData],
    );

    const branchCollection = useMemo(
        () => createListCollection({
            items: (branchesData?.branches ?? []).map((b) => ({
                label: b.name,
                value: String(b.id),
            })),
        }),
        [branchesData],
    );

    const branchFilterCollection = useMemo(
        () => createListCollection({
            items: [
                { label: "Todas las sucursales", value: "" },
                ...(branchesData?.branches ?? []).map((b) => ({
                    label: b.name,
                    value: String(b.id),
                })),
            ],
        }),
        [branchesData],
    );

    const labels: label<StockItem>[] = [
        { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
        { labelName: "Nombre", propName: "productName", isSortable: true, sortFunction: (a, b) => a.productName.localeCompare(b.productName) },
        { labelName: "Nombre Sucursal", propName: "branchName", isSortable: true, sortFunction: (a, b) => a.branchName.localeCompare(b.branchName) },
        {
            labelName: "Cantidad",
            isComponent: true,
            render: (item) => (serviceIds.has(item.productId) ? "-" : item.quantity),
            isSortable: true,
            sortFunction: (a, b) => a.quantity - b.quantity,
        },
    ];

    const handleNewItem = () => {
        setItemType("product");
        setFormProductId(0);
        setFormBranchId(0);
        setFormQuantity("");
        setIsEditing(false);
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEditItem = () => {
        if (!selectedItem) return;
        setItemType(serviceIds.has(selectedItem.productId) ? "service" : "product");
        setFormProductId(selectedItem.productId);
        setFormBranchId(selectedItem.branchId);
        setFormQuantity(selectedItem.quantity.toString());
        setIsEditing(true);
        setEditingItem({ ...selectedItem });
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setItemType("product");
        setFormProductId(0);
        setFormBranchId(0);
        setFormQuantity("");
        setIsEditing(false);
        setEditingItem(null);
    };

    const handleSubmitForm = async () => {
        if (!formProductId || formProductId === 0) {
            toaster.create({ title: "Error", description: `Seleccioná un ${itemType === "service" ? "servicio" : "producto"}`, type: "error" });
            return;
        }
        if (!formBranchId || formBranchId === 0) {
            toaster.create({ title: "Error", description: "Seleccioná una sucursal", type: "error" });
            return;
        }
        if (itemType === "product" && (!formQuantity || isNaN(Number(formQuantity)) || Number(formQuantity) < 0)) {
            toaster.create({ title: "Error", description: "La cantidad es inválida", type: "error" });
            return;
        }

        const quantityToSend = itemType === "service" ? 0 : Number(formQuantity);

        const selectedName = itemType === "service"
            ? servicesData?.services.find((s) => s.id === formProductId)?.name
            : productsData?.products.find((p) => p.id === formProductId)?.name;
        const selectedBranch = branchesData?.branches.find(b => b.id === formBranchId);

        try {
            if (isEditing && editingItem) {
                await editItem.mutateAsync({
                    id: editingItem.id,
                    data: {
                        productId: formProductId,
                        productName: selectedName ?? "",
                        branchId: formBranchId,
                        branchName: selectedBranch?.name ?? "",
                        quantity: quantityToSend
                    }
                });
                toaster.create({ title: "Éxito", description: `${selectedName} fue actualizado`, type: "success" });
            } else {
                const existingItem = allStock?.stocks.find(
                    item => item.productId === formProductId && item.branchId === formBranchId
                );

                if (existingItem && itemType === "product") {
                    const newQuantity = existingItem.quantity + Number(formQuantity);
                    await editItem.mutateAsync({
                        id: existingItem.id,
                        data: {
                            productId: formProductId,
                            productName: selectedName ?? "",
                            branchId: formBranchId,
                            branchName: selectedBranch?.name ?? "",
                            quantity: newQuantity
                        }
                    });
                    toaster.create({
                        title: "Éxito",
                        description: `Se agregaron ${formQuantity} unidades de ${selectedName}`,
                        type: "success"
                    });
                } else {
                    await createItem.mutateAsync({
                        productId: formProductId,
                        productName: selectedName ?? "",
                        branchId: formBranchId,
                        branchName: selectedBranch?.name ?? "",
                        quantity: quantityToSend
                    });
                    toaster.create({ title: "Éxito", description: `${selectedName} fue creado`, type: "success" });
                }
            }

            setShowForm(false);
            setItemType("product");
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
    const filteredStocks = filterBranchId
        ? stocks.filter(s => s.branchId === filterBranchId)
        : stocks;
    const paginatedStocks = filteredStocks.slice((params.page - 1) * params.pageSize, params.page * params.pageSize);

    const pagination = {
        currentPage: params.page,
        pageSize: params.pageSize,
        totalElements: filteredStocks.length,
        totalPages: Math.ceil(filteredStocks.length / params.pageSize),
    };

    const currentCollection = itemType === "service" ? serviceCollection : productCollection;

    return (
        <Box padding={5} display="flex" flexDirection="column" gap={4}>
            <PageTitle>Listado de Productos en Inventario</PageTitle>

            <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Buscar en inventario..." />
                </InputGroup>
                <Select.Root
                    collection={branchFilterCollection}
                    value={filterBranchId ? [String(filterBranchId)] : [""]}
                    onValueChange={(e) => {
                        const val = e.value[0];
                        setFilterBranchId(val ? Number(val) : null);
                        setParams({ ...params, page: 1 });
                    }}
                    size="sm"
                    width="180px"
                >
                    <Select.HiddenSelect />
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Filtrar por sucursal" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
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
                <Box display="flex" flexDirection="row" gap={2}>
                    <Text fontSize="sm" color="gray.500" alignSelf="center">Registros por Pág. </Text>
                    <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
                </Box>
                <DestructiveActionDialog
                    title="Eliminar Producto"
                    description="Una vez eliminado el producto, la acción es irreversible"
                    onAccept={handleDeleteItem}
                    trigger={
                        <IconButton padding={2} variant="outline" colorPalette="brand" disabled={!selectedItem || isPending}>
                            {deleteItem.isPending ? <Spinner /> : <Trash2Icon size={16} />}
                            Eliminar
                        </IconButton>
                    }
                />
                <IconButton padding={2} variant="outline" colorPalette="brand" disabled={!selectedItem} onClick={handleEditItem}>
                    <Pencil size={16} />
                    Editar
                </IconButton>
                <IconButton
                    padding={2}
                    colorPalette="brand"
                    onClick={handleNewItem}
                >
                    <Plus size={16} />
                    Nuevo
                </IconButton>
            </Box>

            <Collapsible.Root open={showForm} onOpenChange={(e) => setShowForm(e.open)}>
                <Collapsible.Content>
                    <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" mb={4}>
                        <VStack gap={3} align="stretch">
                            <Text fontWeight="bold" fontSize="lg">
                                {isEditing ? "Editar Item" : "Nuevo Item"}
                            </Text>

                            <RadioGroup.Root
                                value={itemType}
                                onValueChange={(e) => {
                                    setItemType(e.value as "product" | "service");
                                    setFormProductId(0);
                                    setFormQuantity("");
                                }}
                                disabled={isEditing || isPending}
                            >
                                <HStack gap={6}>
                                    <RadioGroup.Item value="product">
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>Producto</RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                    <RadioGroup.Item value="service">
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>Servicio</RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                </HStack>
                            </RadioGroup.Root>

                            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3}>
                                <Field.Root required>
                                    <Field.Label>{itemType === "service" ? "Servicio" : "Producto"}</Field.Label>
                                    <Select.Root
                                        collection={currentCollection}
                                        value={formProductId ? [String(formProductId)] : []}
                                        onValueChange={(e) => setFormProductId(Number(e.value[0]))}
                                        disabled={isPending}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder={`Seleccionar ${itemType === "service" ? "servicio" : "producto"}`} />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {currentCollection.items.map((item) => (
                                                        <Select.Item item={item} key={item.value}>
                                                            {item.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label>Sucursal</Field.Label>
                                    <Select.Root
                                        collection={branchCollection}
                                        value={formBranchId ? [String(formBranchId)] : []}
                                        onValueChange={(e) => setFormBranchId(Number(e.value[0]))}
                                        disabled={isPending}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Seleccionar sucursal" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {branchCollection.items.map((item) => (
                                                        <Select.Item item={item} key={item.value}>
                                                            {item.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                </Field.Root>

                                <Field.Root required={itemType === "product"}>
                                    <Field.Label>Cantidad</Field.Label>
                                    <Input
                                        value={itemType === "service" ? "" : formQuantity}
                                        onChange={(e) => setFormQuantity(e.target.value)}
                                        placeholder={itemType === "service" ? "No aplica" : "0"}
                                        type="number"
                                        min="0"
                                        disabled={isPending || itemType === "service"}
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
                key={String(params.page)}
                data={paginatedStocks}
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

            <PaginationControl
                pagination={pagination}
                onPageChange={(page: number) => { setParams({ ...params, page }) }}
            />
        </Box>
    );
}