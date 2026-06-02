import { SearchProductsDialog } from "@/components/ui/dialogs/search-products-dialog";
import { Box } from "@chakra-ui/react/box";
import { IconButton } from "@chakra-ui/react/button";
import { Input } from "@chakra-ui/react/input";
import { Kbd } from "@chakra-ui/react/kbd";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Text } from "@chakra-ui/react/text"
import { PackageOpenIcon, Plus } from "lucide-react";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableEditable, { type EditableLabel } from "@/components/ui/table-edit";
import { useAllProducts } from "@/queries/catalog.queries";
import { Spinner } from "@chakra-ui/react";
import type { ProductSelect } from "@/types/sales";

export interface PurchaseProductRow {
  id: number;
  productId: number;
  productName: string;
  quantityRequested: number;
}

interface PurchaseProductsTableProps {
  products: PurchaseProductRow[];
  onDataChange: (newData: PurchaseProductRow[]) => void;
  readOnly: boolean;
}

export default function PurchaseProductsTable({ products, onDataChange, readOnly }: PurchaseProductsTableProps) {
  const addProdRef = useRef<HTMLButtonElement>(null);
  const [productCode, setProductCode] = useState("");
  const { data: aviableProducts, isPending: loadingProducts, isError: isErrorProducts, error: errorProducts } = useAllProducts();
  let nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  useHotkeys("ctrl+i", () => {
    if (readOnly) return;
    addProdRef.current?.click();
  });

  const generateRow = (product: ProductSelect, quantity: number): PurchaseProductRow => ({
    id: nextId++,
    productId: product.id,
    productName: product.name || "Producto sin nombre",
    quantityRequested: quantity,
  });

  const labels: EditableLabel<PurchaseProductRow>[] = [
    {
      labelName: "Nombre",
      propName: "productName",
      isSortable: true,
      sortFunction: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      labelName: "Cantidad Solicitada",
      propName: "quantityRequested",
      isEditable: !readOnly,
      inputType: "number",
      validate: (value: number | string) => Number(value) > 0,
      transform: (value: string) => Number(value),
      onEdit: (item: PurchaseProductRow, newValue: string | number | null | undefined) => {
        if (!newValue) return item;
        return { ...item, quantityRequested: Number(newValue) };
      },
    },
    {
      labelName: "",
      isComponent: true,
      render: (item: PurchaseProductRow) =>
        !readOnly ? (
          <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => onDataChange(products.filter(p => p.id !== item.id))}>
            <Plus size={14} style={{ transform: "rotate(45deg)" }} />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <Box flex={1}>
      {!readOnly && (
        <Box display="flex" flexDirection="row" gap={3}>
          <Input placeholder="Insertar código de producto" mb={3} size="sm" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
          <SearchProductsDialog
            products={aviableProducts?.products || []}
            onSelect={(product: ProductSelect, quantity: number) => {
              onDataChange([...products, generateRow(product, quantity)]);
            }}
            selectedProductsIds={products.map(p => p.productId)}
            loading={loadingProducts}
            error={errorProducts}
            isError={isErrorProducts}
            careStock={false}
            trigger={
              <IconButton padding={4} size="sm" variant="surface" disabled={!aviableProducts} ref={addProdRef}>
                {aviableProducts ? <Plus /> : <Spinner />} Item
              </IconButton>
            }
          />
        </Box>
      )}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="46vh">
        <TableEditable
          labels={labels}
          data={products}
          height="100%"
          onDataChange={onDataChange}
          noItemsComponent={
            <EmptyDataScreen
              title="Sin productos"
              icon={<PackageOpenIcon />}
              message={readOnly ? "Este pedido no tiene productos registrados." : "Agrega productos al pedido de compra"}
              children={
                <Text fontSize="xs" color="gray.500" mt={1}>
                  <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">I</Kbd> para abrir menú de búsqueda rápida
                </Text>
              }
            />
          }
        />
      </Box>
    </Box>
  );
}
