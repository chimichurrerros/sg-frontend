import { Button, CloseButton, IconButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Portal } from "@chakra-ui/react/portal";
import { Text } from "@chakra-ui/react/text"
import { FileQuestion, Plus } from "lucide-react";
import { InputGroup } from "@chakra-ui/react/input-group";
import React from "react";
import { LuMinus, LuPlus, LuSearch } from "react-icons/lu";
import { Input } from "@chakra-ui/react/input";
import { useHotkeys } from "react-hotkeys-hook";
import { NumberInput } from "@chakra-ui/react/number-input";
import { HStack } from "@chakra-ui/react/stack";
import { Box, Kbd } from "@chakra-ui/react";
import TableSelect, { type label } from "../table-select";
import type { ProductSelect } from "@/types/sales";
import EmptyDataScreen from "../screens/empty-data-screen";


interface SearchProductsDialogProps {
    trigger?: React.ReactNode;
    onSelect: (product:ProductSelect,quantity:number)=>void
    selectedProductsIds:number[]  //This is in order to show products that you have not add before
    products:ProductSelect[]
    loading:boolean
    isError:boolean
    error:Error | null
}

export const SearchProductsDialog = ({ trigger,onSelect,selectedProductsIds,products,loading,error,isError }: SearchProductsDialogProps) => {

    const [selectedProduct, setSelectedProduct] = React.useState<ProductSelect | null>(null);
    const addref = React.useRef<HTMLButtonElement>(null);
    const [quantity, setQuantity] = React.useState(1);
    const [searchParam,setSearchParam] = React.useState("")


    const labels: label<ProductSelect>[] = [
        {labelName:"Cód.",propName:"barcode",textIfNull:"---"},
        { labelName: "Nombre", propName: "name"},
        { labelName: "Precio", propName: "price" },
        { labelName: "Stock", propName: "minimumStock" }
    ];

    useHotkeys('ctrl+down', (event) => {
        event.preventDefault();
        setQuantity(Math.max(1, quantity - 1));
    });

    useHotkeys('ctrl+up', (event) => {
        event.preventDefault();
        setQuantity(Math.min(99, quantity + 1));
    });

    // useHotkeys('enter', (event) => {
    //     event.preventDefault();
    //     if (!selectedProduct) return;
    //     addref.current?.click();
    // });

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
                                <Input placeholder="Buscar productos..." value={searchParam}onChange={(e)=>setSearchParam(e.target.value)} />
                            </InputGroup>
                            <Text fontSize="xs" color="gray.500" my={2} fontStyle="italic">
                                Selecciona y agrega el producto con enter <Kbd size="sm">⏎</Kbd> o el botón de agregar.  
                                <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">↑</Kbd> y <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">↓</Kbd> para aumentar y disminuir cantidad
                            </Text>
                            
                            <TableSelect
                                labels={labels}
                                data={products
                                    .filter((p:ProductSelect)=>!selectedProductsIds.includes(p.id))
                                    .filter((p:ProductSelect)=>p.name?.toLowerCase().includes(searchParam.toLowerCase()) )
                                }
                                onSelect={setSelectedProduct}
                                onDoubleClick={(product) => {
                                    setSelectedProduct(product);
                                    addref.current?.click();
                                }}
                                noItemsComponent={<EmptyDataScreen title={"No hay productos registrados o disponibles"} icon={<FileQuestion/>}message={"No se encontraron productos, prueba a buscar con otro nombre"}/>}
                                height="300px"
                                loading={loading}
                                error={error}
                                isError={isError}
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
                            <Text color="red.500" fontSize="xs" fontStyle="italic" visibility={selectedProduct && quantity > products.find(p => p.id === selectedProduct.id)?.minimumStock! ? "visible" : "hidden"}>
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
                                        disabled={!selectedProduct || (selectedProduct ? quantity > products.find(p => p.id === selectedProduct.id)?.minimumStock! : false)}
                                        ref={addref}
                                        onClick={()=>selectedProduct && onSelect(selectedProduct,quantity)}
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