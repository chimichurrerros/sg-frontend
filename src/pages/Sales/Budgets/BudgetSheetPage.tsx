import type { BudgetForm } from "@/types/budgets";
import { Box, Flex, IconButton, Input, Text } from "@chakra-ui/react";
import { ExternalLink, Printer, X } from "lucide-react";
import { useState } from "react";
import ProductsTable from "../components/ProductsTable";
import { paymentOptions, saleConditionOptions, type PaymentMethod, type ProductSaleDTO, type SaleCondition } from "@/types/sales";
import type { EditableLabel } from "@/components/ui/table-edit";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import type { CustomerForSales } from "@/types/types";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { RadioGroupWrapper } from "@/components/ui/radio-group-wrapper";

interface budgetSheetPageProps {
    mode: "create" | "edit"
}
export default function BudgetSheetPage({ mode }: budgetSheetPageProps) {
    const productsLabel: EditableLabel<ProductSaleDTO>[] = [
        { labelName: "Código", propName: "barcode", textIfNull: "-" },
        { labelName: "Nombre", propName: "name", textIfNull: "Producto sin nombre" },
        {
            labelName: "Descripción", propName: "description",
            textIfNull: "Sin Descripción",
            transform: (d: string) => d && d.length > 35 ? d.slice(0, 25) + "..." : d
        },

        {
            labelName: "Cantidad", propName: "quantity",
            isEditable: true, inputType: "number",
            validate: (value: number | string) => Number(value) > 0,
            transform: (value: string) => Number(value),
            onEdit: (item: ProductSaleDTO, newValue: string | number | null | undefined) => { if (!newValue) return item; return { ...item, quantity: Number(newValue), total: item.price * Number(newValue) } }
        },
        { labelName: "Precio Unitario", propName: "price" },
        { labelName: "Total", propName: "total" },
        {
            labelName: "", isComponent: true, render: (item: ProductSaleDTO) =>
                <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => setBudgetForm({ ...budgetForm, products: budgetForm.products.filter((p: ProductSaleDTO) => p.id !== item.id) })}>
                    <X />
                </IconButton>
        }
    ];


    // states
    const [budgetForm, setBudgetForm] = useState<BudgetForm>({
        creationDate: Date.now().toString(),
        products: [],
        condition: "Contado",
        payMethod: "Efectivo"
    })
    const [selectedClient, setSelectedClient] = useState<CustomerForSales | "">("");
    const customersMock: CustomerForSales[] = [{ id: 1, name: "Juan Pérez", ruc: "12345678-9" }, { id: 2, name: "María Gómez", ruc: "98765432-1" }, { id: 3, name: "Carlos López", ruc: "45678912-3" }]
    const handleClientSelect = (id: string) => {
        const selected = customersMock.find(c => c.id.toString() === id) || ""
        setSelectedClient(selected);
        if (selected) {
            setBudgetForm({ ...budgetForm, customer: selected, customerName: selected.name, ruc: selected.ruc })
        } else {
            setBudgetForm({ ...budgetForm, customer: undefined, customerName: "", ruc: "" })
        }
    };
    const updateCustomerName = (value: string) => {
        setBudgetForm({
          ...budgetForm,
            customerName: value,
          });   
      };
      const updatePaymentMethod = (value: PaymentMethod) => {
        setBudgetForm({
          ...budgetForm,
            payMethod: value
          });   
      }
    
      const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedRuc = e.target.value;
        setBudgetForm({
          ...budgetForm,
            ruc: formattedRuc
          }
        );
      };
    

        const updateSaleCondition = (value: string) => {
          setBudgetForm({
            ...budgetForm,
            condition: value as SaleCondition,
          });
        };
      

    return (<Box>
        <Flex justify="space-between" align="center" mb={4} gap={6} >
            <Text fontSize="2xl" fontWeight="bold">
                {mode === "create" && "Nuevo"} Presupuesto (N° XXXX)
            </Text>
            <Flex align="center" gap={3}>
                <Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
                <Input value={budgetForm.bill?.number || "-"} w="170px" size="sm" readOnly />
                <IconButton size="md" padding={4} variant="outline" disabled={!budgetForm.bill}>
                    <Printer /> Imprimir Factura Legal
                </IconButton>
                {mode === "edit" && <IconButton size="md" padding={4} variant="ghost" disabled={!budgetForm.bill}>
                    <ExternalLink /> Ver Factura
                </IconButton>}
            </Flex>
        </Flex>
        <Flex gap={4} align="flex-end" mb={3} wrap="wrap" justifyContent="space-between">
            <Box flex={1.5} minW="180px">
                <Text fontSize="xs" fontWeight="medium" color="gray.600">Cargar Cliente</Text>
                <ComboboxWrapper
                    placeholder="Buscar cliente..."
                    value={selectedClient === ""? "" : selectedClient.name}
                    onValueChange={handleClientSelect}
                    options={customersMock.map(c => ({ value: c.id.toString(), label: c.name }))}
                    width="100%"
                />
            </Box>

            <Box flex={2} minW="180px">
                <Text fontSize="xs" fontWeight="medium" color="gray.600">Nombre/Razón Social</Text>
                <Input
                    size="sm"
                    value={budgetForm.customerName}
                    onChange={(e) => updateCustomerName(e.target.value)}
                    readOnly={selectedClient !== ""}
                    bg={selectedClient !== "" ? "gray.100" : "white"}
                />
            </Box>

            <Box flex={1.2} minW="150px">
                <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
                <Input
                    size="sm"
                    placeholder="0000000-0"
                    value={budgetForm.ruc}
                    readOnly={selectedClient === ""}
                    bg={selectedClient !== "" ? "gray.100" : "white"}
                    onChange={handleRucChange}
                />
            </Box>

            <Box minW="130px">
                <Text fontSize="xs" fontWeight="medium" color="gray.600">Método de Pago</Text>
                <SelectWrapper
                    value={budgetForm.payMethod}
                    onValueChange={(updatePaymentMethod)}
                    options={paymentOptions}
                    width="100%"
                />
            </Box>

            <Box minW="150px">
                <Text fontSize="xs" fontWeight="medium" color="gray.600">Condición de Venta</Text>
                <RadioGroupWrapper
                    value={budgetForm.condition}
                    onValueChange={updateSaleCondition}
                    options={saleConditionOptions}
                />
            </Box>
        </Flex>
        <ProductsTable
            products={budgetForm.products}
            onDataChange={(newData: ProductSaleDTO[]) => setBudgetForm({ ...budgetForm, products: newData })}
            labels={productsLabel}
            readOnly={mode === "edit"}
        />
    </Box>);

}