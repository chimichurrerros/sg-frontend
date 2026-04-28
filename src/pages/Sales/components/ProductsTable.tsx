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
//This component is a table where you put product to sell or to make a budget
interface productsTableProps {
  products: ProductSaleDTO[];
  onDataChange: (newData: ProductSaleDTO[]) => void
  labels: EditableLabel<ProductSaleDTO>[]
  readOnly: boolean
}
const mock_products = [
  { id: 1, description: "Producto 1", unitPrice: 10, stock: 5, code: "123" },
  { id: 2, description: "Producto 2", unitPrice: 20, stock: 10, code: "321" },
  { id: 3, description: "Producto 3", unitPrice: 30, stock: 15, code: "213" },
  { id: 4, description: "Producto 4", unitPrice: 40, stock: 20, code: "333" },
  { id: 5, description: "Producto 5", unitPrice: 50, stock: 25, code: "111" },
  { id: 6, description: "Producto 6", unitPrice: 60, stock: 30, code: "222" },
  { id: 7, description: "Producto 7", unitPrice: 70, stock: 35, code: "432" },
  { id: 8, description: "Producto 8", unitPrice: 80, stock: 40, code: "234" },
  { id: 9, description: "Producto 9", unitPrice: 90, stock: 45, code: "342" },
  { id: 10, description: "Producto 10", unitPrice: 100, stock: 50, code: "444" }
]
export default function ProductsTable({ products, onDataChange, labels, readOnly }: productsTableProps) {
  const addProdRef = useRef<HTMLButtonElement>(null);
  const [productCode, setProductCode] = useState("")
  useHotkeys("ctrl+i", () => {
    if (readOnly) return
    addProdRef.current?.click();
  });

  const generateProductSaleDTO = (product: ProductSelect, quantity: number) => {
    return { ...product, quantity, total: (quantity * product.unitPrice) } as ProductSaleDTO
  }

  useEffect(() => {
    const prod = mock_products.find(p => p.code == productCode)
    if (prod) {
      const exist = products.some(p => p.id === prod.id)
      if (exist) {
        onDataChange(products.map(p => p.id === prod.id ? { ...p, quantity: p.quantity + 1, total: (p.quantity+1)*p.unitPrice} : p))
      } else {
        onDataChange([...products, { ...prod, quantity: 1, total: prod.unitPrice }])
      }
      setProductCode("")
    }
  }, [productCode])

  return (<Box flex={1}>
    {!readOnly && <Box display="flex" flexDirection="row" gap={3}>
      <Input placeholder="Insertar código de producto" mb={3} size="sm" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
      <SearchProductsDialog
        products={mock_products}
        onSelect={(product: ProductSelect, quantity: number) => { onDataChange([...products, generateProductSaleDTO(product, quantity)]) }}
        selectedProductsIds={products.map((p: ProductSaleDTO) => p.id)}
        trigger={<IconButton padding={4} size="sm" variant="surface"
          ref={addProdRef}
        >  <Plus /> Item </IconButton>} />
    </Box>}
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
      <TableEditable
        labels={labels}
        data={products}
        height="47vh"
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