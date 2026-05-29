import { SearchProductsDialog } from "@/components/ui/dialogs/search-products-dialog";
import { Box } from "@chakra-ui/react/box";
import { IconButton } from "@chakra-ui/react/button";
import { Input } from "@chakra-ui/react/input";
import { Kbd } from "@chakra-ui/react/kbd";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Text } from "@chakra-ui/react/text"
import { PackageOpenIcon, Plus } from "lucide-react";
import type { ProductSaleDTO, ProductSelect } from "@/types/sales";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import {  useProductByBranch } from "@/queries/catalog.queries";
import { Spinner } from "@chakra-ui/react";
import type { ProductDTO } from "@/api/catalog.api";
//This component is a table where you put product to sell or to make a budget
interface productsTableProps {
  products: ProductDTO[];
  onDataChange: (newData: ProductSaleDTO[]) => void;
  labels: EditableLabel<ProductSaleDTO>[];
  readOnly: boolean;
  branchId: number | null;
}

export default function ProductsTable({ products, onDataChange, labels, readOnly, branchId }: productsTableProps) {
  const addProdRef = useRef<HTMLButtonElement>(null);
  const [productCode, setProductCode] = useState("")
  const { data: aviableProducts, isPending: loadingProducts, isError: isErrorProducts, error: errorProducts } = useProductByBranch(branchId, !readOnly)

  useHotkeys("ctrl+i", () => {
    if (readOnly || !branchId) return
    addProdRef.current?.click();
  });

  const generateProductSaleDTO = (product: ProductSelect, quantity: number,stock: number) => {
    return { ...product,stock, quantity, total: (quantity * product.price), } as ProductSaleDTO
  }

 useEffect(() => {
    if (!aviableProducts?.productsStock || !productCode) return; 

    const prod = aviableProducts.productsStock.find(p => p.barcode === productCode) 
    if (!prod) return;

    const exist = products.some(p => p.id === prod.id);

    if (exist) {
        onDataChange(products.map(p =>
            p.id === prod.id
                ? { ...p, quantity: Math.min(p.quantity + 1,p.stock), total: (p.quantity + 1) * p.price }
                : p
        ));
    } else {
        onDataChange([...products, { ...prod, quantity: 1, total: prod.price, stock: prod.stock } as ProductSaleDTO]);
    }
    setProductCode("");
}, [productCode, aviableProducts]); 

  return (<Box flex={1} display="flex" flexDirection="column" minHeight="0" height="100%">
    {!readOnly && <Box display="flex" flexDirection="row" gap={3} flexShrink={0}>
      <Input placeholder="Insertar código de producto" mb={3} size="sm" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
      {<SearchProductsDialog
        products={aviableProducts?.productsStock || []}
        onSelect={(product: ProductSelect, quantity: number) => { onDataChange([...products, generateProductSaleDTO(product, quantity,product.quantity)]) }}
        selectedProductsIds={products.map((p: ProductDTO) => p.id)}
        loading={loadingProducts}
        error={errorProducts}
        isError={isErrorProducts}
        trigger={<IconButton padding={4} size="sm" variant="surface" disabled={!aviableProducts || !branchId}
          ref={addProdRef}
        >  {aviableProducts || !branchId ? <Plus /> : <Spinner />} Item </IconButton>} />}
    </Box>}
    <Box flex="1" minHeight="0" borderColor="gray.200" borderRadius="md" overflow="hidden">
      <TableEditable
        labels={labels}
        data={products}
        height="100%"
        readOnly={readOnly}
        onDataChange={onDataChange}
        noItemsComponent=
        {<EmptyDataScreen title={"Sin productos"} icon={<PackageOpenIcon />}
          message={"Escanea o agrega nuevos productos para realizar la venta"} children={<Text fontSize="xs" color="gray.500" mt={1}>
            <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">I</Kbd> para abrir menú de búsqueda rápida
          </Text>} />}
      />
    </Box>
  </Box>);
}