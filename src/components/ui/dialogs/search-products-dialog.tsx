import { Button, CloseButton, IconButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Portal } from "@chakra-ui/react/portal";
import { Text } from "@chakra-ui/react/text"
import { Plus } from "lucide-react";
import { InputGroup } from "@chakra-ui/react/input-group";
import React from "react";
import { LuMinus, LuPlus, LuSearch } from "react-icons/lu";
import { Input } from "@chakra-ui/react/input";
import { useHotkeys } from "react-hotkeys-hook";
import { NumberInput } from "@chakra-ui/react/number-input";
import { HStack } from "@chakra-ui/react/stack";
import { Box, Kbd } from "@chakra-ui/react";
import TableSelect, { type label } from "../table-select";

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

interface SearchProductsDialogProps {
    trigger?: React.ReactNode;
}

export const SearchProductsDialog = ({ trigger }: SearchProductsDialogProps) => {

    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const addref = React.useRef<HTMLButtonElement>(null);
    const [quantity, setQuantity] = React.useState(1);

    const mock_productos: Product[] = [
        { id: 1, name: "Producto 1", price: 10, stock: 5 },
        { id: 2, name: "Producto 2", price: 20, stock: 10 },
        { id: 3, name: "Producto 3", price: 30, stock: 15 },
        { id: 4, name: "Producto 4", price: 40, stock: 20 },
        { id: 5, name: "Producto 5", price: 50, stock: 25 },
        { id: 6, name: "Producto 6", price: 60, stock: 30 },
        { id: 7, name: "Producto 7", price: 70, stock: 35 },
        { id: 8, name: "Producto 8", price: 80, stock: 40 },
        { id: 9, name: "Producto 9", price: 90, stock: 45 },
        { id: 10, name: "Producto 10", price: 100, stock: 50 },
    ];

    const labels: label<Product>[] = [
        { labelName: "Descripción", propName: "name"},
        { labelName: "Precio", propName: "price" },
        { labelName: "Stock", propName: "stock" }
    ];

    useHotkeys('ctrl+down', (event) => {
        event.preventDefault();
        setQuantity(Math.max(1, quantity - 1));
    });

    useHotkeys('ctrl+up', (event) => {
        event.preventDefault();
        setQuantity(Math.min(99, quantity + 1));
    });

    useHotkeys('enter', (event) => {
        event.preventDefault();
        if (!selectedProduct) return;
        addref.current?.click();
    });

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger || <Button variant="outline">Abrir</Button>}
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Dialog.Content width="800px" maxWidth="95%">
                        <Dialog.Header display="flex" alignItems="center" gap={2}>
                            <Dialog.Title fontSize="lg" fontWeight="semibold">
                                Búsqueda de productos
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb={4}>
                            <InputGroup flex="1" startElement={<LuSearch />}>
                                <Input placeholder="Buscar productos..." />
                            </InputGroup>
                            <Text fontSize="xs" color="gray.500" my={2} fontStyle="italic">
                                Selecciona y agrega el producto con enter <Kbd size="sm">⏎</Kbd> o el botón de agregar.  
                                <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">↑</Kbd> y <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">↓</Kbd> para aumentar y disminuir cantidad
                            </Text>
                            
                            <TableSelect
                                labels={labels}
                                data={mock_productos}
                                onSelect={setSelectedProduct}
                                onDoubleClick={(product) => {
                                    setSelectedProduct(product);
                                    addref.current?.click();
                                }}
                                height="300px"
                                loading={false}
                            />
                        </Dialog.Body>
                        <Dialog.Footer display="flex" justifyContent="space-between" alignItems="center">
                            <NumberInput.Root value={String(quantity)} unstyled spinOnPress={false}>
                                <HStack gap="2">
                                    <NumberInput.DecrementTrigger asChild>
                                        <IconButton variant="outline" size="xs" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                            <LuMinus />
                                        </IconButton>
                                    </NumberInput.DecrementTrigger>
                                    <NumberInput.ValueText textAlign="center" fontSize="md" minW="3ch" />
                                    <NumberInput.IncrementTrigger asChild>
                                        <IconButton variant="outline" size="xs" onClick={() => setQuantity(quantity + 1)}>
                                            <LuPlus />
                                        </IconButton>
                                    </NumberInput.IncrementTrigger>
                                </HStack>
                            </NumberInput.Root>
                            <Text color="red.500" fontSize="xs" fontStyle="italic" visibility={selectedProduct && quantity > mock_productos.find(p => p.id === selectedProduct.id)?.stock! ? "visible" : "hidden"}>
                                * La cantidad es mayor al stock disponible del producto seleccionado 
                            </Text>
                            <Box display="flex" gap={2}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="surface" colorPalette="gray">
                                        Cancelar
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="surface"
                                        colorPalette="green"
                                        disabled={!selectedProduct || (selectedProduct ? quantity > mock_productos.find(p => p.id === selectedProduct.id)?.stock! : false)}
                                        ref={addref}
                                    >
                                        Agregar
                                        <Plus size={16} style={{ marginLeft: 8 }} />
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Box>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};