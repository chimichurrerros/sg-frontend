import { Button, CloseButton, IconButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Portal } from "@chakra-ui/react/portal";
import { Table } from "@chakra-ui/react/table";
import { Text } from "@chakra-ui/react/text"
import { Plus } from "lucide-react";
import { InputGroup } from "@chakra-ui/react/input-group";
import React, { useEffect } from "react";
import { LuMinus, LuPlus, LuSearch } from "react-icons/lu";
import { Input } from "@chakra-ui/react/input";
import { useHotkeys } from "react-hotkeys-hook";
import { NumberInput } from "@chakra-ui/react/number-input";
import { HStack } from "@chakra-ui/react/stack";
import { Box, Kbd } from "@chakra-ui/react";
interface SearchProductsDialogProps {
    trigger?: React.ReactNode;
}
/*
    Dialog to search products 
    */
export const SearchProductsDialog =
    ({ trigger }: SearchProductsDialogProps) => {

        const [selectedProduct, setSelectedProduct] = React.useState<number | null>(null);
        const addref = React.useRef<HTMLButtonElement>(null);
        const [quantity, setQuantity] = React.useState(1);
        const selectedRowRef = React.useRef<HTMLTableRowElement | null>(null);

        const mock_productos = [
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

        const moverArriba = () => {
            if (!selectedProduct) {setSelectedProduct(1); return;}
            setSelectedProduct(Math.max(selectedProduct - 1, 1));
        };

        const moverAbajo = () => {
            if (!selectedProduct) {setSelectedProduct(mock_productos.length-1); return;}
            setSelectedProduct(Math.min(selectedProduct + 1, mock_productos.length));
        };

        useHotkeys('up', (event) => {
            event.preventDefault();
            moverArriba();
        });

        useHotkeys('ctrl+down', (event) => {
            event.preventDefault();
            setQuantity(Math.max(1, quantity - 1));
        });

        useHotkeys('ctrl+up', (event) => {
            event.preventDefault();
            setQuantity(Math.min(99, quantity + 1));
        });

        useHotkeys('down', (event) => {
            event.preventDefault();
            moverAbajo();
        });

        useHotkeys('enter', (event) => {
            event.preventDefault();
            if (!selectedProduct) return;
            addref.current?.click();
        });

        useEffect(() => {
        if (selectedRowRef.current) {
            selectedRowRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selectedProduct]);
    
        return (
            <Dialog.Root  >
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
                                <InputGroup flex="1" startElement={<LuSearch />}  >
                                    <Input placeholder="Buscar productos..." />
                                </InputGroup>
                                <Text fontSize="xs" color="gray.500" my={2} fontStyle="italic">
                                    Selecciona y agrega el producto con enter <Kbd size="sm">⏎</Kbd> o el botón de agregar .  
                                    <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">↑</Kbd>   y   <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">↓</Kbd> para aumentar y disminuir cantidad
                                </Text>
                                <Table.ScrollArea borderWidth="1px" rounded="md"tabIndex={0} >
                                    <Table.Root size="sm" stickyHeader>
                                        <Table.Header>
                                            <Table.Row bg="bg.subtle" >
                                                <Table.ColumnHeader>Descripción</Table.ColumnHeader>
                                                <Table.ColumnHeader >Precio</Table.ColumnHeader>
                                                <Table.ColumnHeader >Stock</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>

                                        <Table.Body>
                                            {mock_productos.map((prod: any) => (
                                                <Table.Row key={prod.id}
                                                    onClick={() => {
                                                        if (selectedProduct === prod.id) { setSelectedProduct(null); } else { setSelectedProduct(prod.id); }
                                                    }}
                                                    bg={selectedProduct === prod.id ? "green.subtle" : "transparent"}
                                                    ref={selectedProduct === prod.id ? selectedRowRef : null}
                                                    _hover={selectedProduct !== prod.id ? { bg: "gray.100" } : undefined}
                                                >
                                                    <Table.Cell>{prod.name}</Table.Cell>
                                                    <Table.Cell>{prod.price}</Table.Cell>
                                                    <Table.Cell>{prod.stock}</Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Table.ScrollArea>
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
                                <Text color="red.500" fontSize="xs" fontStyle="italic" visibility={selectedProduct && quantity > mock_productos.find(p => p.id === selectedProduct)?.stock! ? "visible" : "hidden"}>
                                    * La cantidad es mayor al stock disponible del producto seleccionado 
                                </Text>
                                <Box display="flex" gap={2}>
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="surface"
                                        colorPalette="gray"
                                        onClick={() => { }}
                                    >
                                        Cancelar
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="surface"
                                        colorPalette="green"
                                        onClick={() => { }}
                                        disabled={!selectedProduct || (selectedProduct? quantity > mock_productos.find(p => p.id === selectedProduct)?.stock! : false)}
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