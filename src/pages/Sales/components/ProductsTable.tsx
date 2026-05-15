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
import { useAllProducts } from "@/queries/catalog.queries";
import { Spinner } from "@chakra-ui/react";
//This component is a table where you put product to sell or to make a budget
interface productsTableProps {
  products: ProductSaleDTO[];
  onDataChange: (newData: ProductSaleDTO[]) => void
  labels: EditableLabel<ProductSaleDTO>[]
  readOnly: boolean
}

export default function ProductsTable({ products, onDataChange, labels, readOnly }: productsTableProps) {
  const addProdRef = useRef<HTMLButtonElement>(null);
  const [productCode, setProductCode] = useState("")
  const { data: aviableProducts, isPending: loadingProducts, isError: isErrorProducts, error: errorProducts } = useAllProducts()

  useHotkeys("ctrl+i", () => {
    if (readOnly) return
    addProdRef.current?.click();
  });

  const generateProductSaleDTO = (product: ProductSelect, quantity: number) => {
    return { ...product, quantity, total: (quantity * product.price) } as ProductSaleDTO
  }

  useEffect(() => {
    if (!aviableProducts?.products) return;
    const prod = aviableProducts?.products.find(p => p.barcode == productCode)
    if (prod) {
      const exist = products.some(p => p.id === prod.id)
      if (exist) {
        onDataChange(products.map(p => p.id === prod.id ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.price } : p))
      } else {
        onDataChange([...products, { ...prod, quantity: 1, total: prod.price } as ProductSaleDTO])
      }
      setProductCode("")
    }
  }, [productCode])

  return (<Box flex={1}>
    {!readOnly && <Box display="flex" flexDirection="row" gap={3}>
      <Input placeholder="Insertar código de producto" mb={3} size="sm" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
      {<SearchProductsDialog
        products={aviableProducts?.products || []}
        onSelect={(product: ProductSelect, quantity: number) => { onDataChange([...products, generateProductSaleDTO(product, quantity)]) }}
        selectedProductsIds={products.map((p: ProductSaleDTO) => p.id)}
        loading={loadingProducts}
        error={errorProducts}
        isError={isErrorProducts}
        trigger={<IconButton padding={4} size="sm" variant="surface" disabled={!aviableProducts}
          ref={addProdRef}
        >  {aviableProducts ? <Plus /> : <Spinner />} Item </IconButton>} />}
    </Box>}
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="46vh">
      <TableEditable
        labels={labels}
        data={products}
        height="100%"
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