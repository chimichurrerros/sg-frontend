import { SearchProductsDialog } from "@/components/ui/dialogs/search-products-dialog";
import type { ProductSaleDTO } from "@/types/types.ts"
import { Box } from "@chakra-ui/react/box";
import { IconButton } from "@chakra-ui/react/button";
import { EmptyState } from "@chakra-ui/react/empty-state";
import { Input } from "@chakra-ui/react/input";
import { Kbd } from "@chakra-ui/react/kbd";
import { VStack } from "@chakra-ui/react/stack";
import { Table } from "@chakra-ui/react/table";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Text } from "@chakra-ui/react/text" 
import { PackageOpenIcon, Plus } from "lucide-react";
//This component is a table where you put product to sell or to make a budget
interface productsTableProps {
    products: ProductSaleDTO[];
}

export default function ProductsTable({products}:productsTableProps) {
     const addProdRef = useRef<HTMLButtonElement>(null);

      useHotkeys("ctrl+i", () => {
    addProdRef.current?.click();
  });

  return (<Box flex={1}>
            <Box display="flex" flexDirection="row" gap={3}>
              <Input placeholder="Insertar código de producto" mb={3} size="sm" />
              <SearchProductsDialog trigger={<IconButton padding={4} size="sm" variant="surface" ref={addProdRef}><Plus /> Item </IconButton>} />
            </Box>
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
              <Table.Root size="md" h="45vh">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader fontSize="xs">Código</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="xs">Descripción</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="xs">Precio Unit.</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="xs">Cantidad</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="xs">Total</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
  
                <Table.Body>
                  {products.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5} p={8}>
                        <EmptyState.Root size="sm">
                          <EmptyState.Content>
                            <EmptyState.Indicator>
                              <PackageOpenIcon size={32} />
                            </EmptyState.Indicator>
                            <VStack textAlign="center" gap={1}>
                              <EmptyState.Title fontSize="md">Sin productos</EmptyState.Title>
                              <EmptyState.Description fontSize="sm">
                                Escanea o busca productos para agregar
                              </EmptyState.Description>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">I</Kbd> para abrir menú de búsqueda rápida
                              </Text>
                            </VStack>
                          </EmptyState.Content>
                        </EmptyState.Root>
                      </Table.Cell>
                    </Table.Row>
                  )}
                  {products.map((producto:ProductSaleDTO, index:number) => (
                    <Table.Row key={index}>
                      <Table.Cell>{producto.codigo}</Table.Cell>
                      <Table.Cell>{producto.descripcion}</Table.Cell>
                      <Table.Cell>{producto.precioUnitario.toLocaleString()} GS.</Table.Cell>
                      <Table.Cell>{producto.cantidad}</Table.Cell>
                      <Table.Cell>{producto.total.toLocaleString()} GS.</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Box>);
}