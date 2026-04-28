import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  IconButton,
  NumberInput,
  Spinner,
} from "@chakra-ui/react";
import { CircleDollarSign, Printer, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { paymentOptions, saleConditionOptions, type PaymentMethod, type ProductSaleDTO, type Sale, type SaleCondition } from "@/types/sales.ts";
import ProductsTable from "./components/ProductsTable";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { RadioGroupWrapper } from "@/components/ui/radio-group-wrapper";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import { type EditableLabel } from "@/components/ui/table-edit";
import { useMask } from "@react-input/mask";
import { useCreateSale } from "@/queries/sales.queries";
import { toaster } from "@/components/ui/toaster";

const getSaleTemplate = (): Sale => ({
  customer: {
    name: "",
    ruc: ""
  },
  sale: {
    date: new Date().toISOString().split('.')[0], 
    cashierNumber: 3,
    saleNumber: 0
  },
  pay: {
    method: "Efectivo",
    condition: "Contado"
  },
  products: [],
  totals: {
    subtotal: 0,
    iva: 0,
    total: 0,
    amount: 0,
    change: 0,
  }
});

interface saleSheetProps {
  mode: "view" | "create"
}

export default function SaleSheetPage({ mode }: saleSheetProps) {
  const [selectedClient, setSelectedClient] = useState("Ninguno");
  const [saleForm, setSaleForm] = useState<Sale>(getSaleTemplate());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const createSale = useCreateSale();

  const rucInputRef = useMask({
    mask: "nnnnnn-n",
    replacement: { n: /\d/ },
    showMask: true,
  });
  const [dialogAmount, setDialogAmount] = useState(0);

  useEffect(() => {
    const subtotal = saleForm.products.reduce((sum, p) => sum + (p.total || 0), 0);
    const total = subtotal;
    const change = dialogAmount >= total ? dialogAmount - total : 0;

    setSaleForm(prev => ({
      ...prev,
      totals: {
        ...prev.totals,
        subtotal,
        total,
        amount: dialogAmount,
        change,
      }
    }));
  }, [saleForm.products, dialogAmount]);

  const productsLabel: EditableLabel<ProductSaleDTO>[] = [
    { labelName: "Código", propName: "barcode", textIfNull:"-" },
    { labelName: "Nombre", propName: "name", textIfNull:"Producto sin nombre"},
    { labelName: "Descripción", propName: "description",
      textIfNull:"Sin Descripción", 
      transform: (d:string) =>d && d.length >35  ?  d.slice(0,35)+"..." : d},

    {
      labelName: "Cantidad", propName: "quantity",
      isEditable: true, inputType: "number",
      validate: (value: number | string) => Number(value) > 0,
      transform: (value: string) => Number(value),
      onEdit: (item: ProductSaleDTO, newValue: string | number | null| undefined) => { if(!newValue) return item; return { ...item, quantity: Number(newValue), total: item.price * Number(newValue) } }
    },
    { labelName: "Precio Unitario", propName: "price" },
    { labelName: "Total", propName: "total" },
    {
      labelName: "", isComponent: true, render: (item: ProductSaleDTO) =>
        <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => setSaleForm({ ...saleForm, products: saleForm.products.filter((p: ProductSaleDTO) => p.id !== item.id) })}>
          <X />
        </IconButton>
    }
  ];

  useHotkeys("ctrl+enter", () => {
    triggerRef.current?.click();
  });

  const handleClientSelect = (value: string) => {
    setSelectedClient(value);
    if (value === "Ninguno") {
      setSaleForm({
        ...saleForm,
        customer: {
          name: "",
          ruc: "",
        },
      });
    } else {
      const clientData: Record<string, { name: string; ruc: string }> = {
        juan: { name: "Juan Pérez", ruc: "1234567-8" },
        maria: { name: "María Gómez", ruc: "2345678-9" },
        carlos: { name: "Carlos López", ruc: "3456789-0" },
      };
      const client = clientData[value];
      if (client) {
        setSaleForm({
          ...saleForm,
          customer: {
            name: client.name,
            ruc: client.ruc,
          },
        });
      }
    }
  };

  const updateCustomerName = (value: string) => {
    setSaleForm({
      ...saleForm,
      customer: {
        ...saleForm.customer,
        name: value,
      },
    });
  };

  const updatePaymentMethod = (value: PaymentMethod) => {
    setSaleForm({
      ...saleForm,
      pay: {
        ...saleForm.pay,
        method: value,
      },
    });
  };

  const updateSaleCondition = (value: string) => {
    setSaleForm({
      ...saleForm,
      pay: {
        ...saleForm.pay,
        condition: value as SaleCondition,
      },
    });
  };

  const isClientEditable = selectedClient === "Ninguno";

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRuc = e.target.value;
    setSaleForm({
      ...saleForm,
      customer: {
        ...saleForm.customer,
        ruc: formattedRuc
      }
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString() + " GS.";
  };

  const isAmountValid = dialogAmount >= saleForm.totals.total;

  return (
    <Box p={2}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          {mode === "create" && "Nueva"} Venta {saleForm.sale.saleNumber ? `(N° ${saleForm.sale.saleNumber})` : ""}
        </Text>
        <Flex align="center" gap={3}>
          <Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
          <Input value={saleForm.sale.bill ? saleForm.sale.bill.number : "-"} w="170px" size="sm" readOnly />
          <IconButton size="md" padding={4} variant="outline" disabled={mode === "create"}>
            <Printer /> Imprimir Factura Legal
          </IconButton>
        </Flex>
      </Flex>

      <Flex gap={4} align="flex-end" mb={3} wrap="wrap" justifyContent="space-between">
        <Box flex={1.5} minW="180px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Cargar Cliente</Text>
          <ComboboxWrapper
            placeholder="Buscar cliente..."
            value={selectedClient}
            onValueChange={handleClientSelect}
            options={[
              { label: "Ninguno", value: "Ninguno" },
              { label: "Juan Pérez", value: "juan" },
              { label: "María Gómez", value: "maria" },
              { label: "Carlos López", value: "carlos" },
            ]}
            width="100%"
          />
        </Box>

        <Box flex={2} minW="180px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Nombre/Razón Social</Text>
          <Input
            size="sm"
            value={saleForm.customer.name}
            onChange={(e) => updateCustomerName(e.target.value)}
            readOnly={!isClientEditable}
            bg={!isClientEditable ? "gray.100" : "white"}
          />
        </Box>

        <Box flex={1.2} minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
          <Input
            ref={rucInputRef}
            size="sm"
            placeholder="0000000-0"
            value={saleForm.customer.ruc}
            readOnly={!isClientEditable}
            bg={!isClientEditable ? "gray.100" : "white"}
            onChange={handleRucChange}
          />
        </Box>

        <Box minW="130px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Método de Pago</Text>
          <SelectWrapper
            value={saleForm.pay.method}
            onValueChange={updatePaymentMethod}
            options={paymentOptions}
            width="100%"
          />
        </Box>

        <Box minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Condición de Venta</Text>
          <RadioGroupWrapper
            value={saleForm.pay.condition}
            onValueChange={updateSaleCondition}
            options={saleConditionOptions}
          />
        </Box>
      </Flex>

      <Box gap={5} h="full" display="flex" flexDirection="row" alignItems="flex-start">
        <ProductsTable products={saleForm.products} labels={productsLabel} readOnly={mode !== "create"} onDataChange={
          (newData: ProductSaleDTO[]) => {
            setSaleForm({
              ...saleForm,
              products: newData
            })
          }} />

        <Box
          w="200px"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="white"
          h="full"
        >
          <Box display="flex" flexDirection="column" gap={4} h="full" justifyContent="space-between">
            {mode === "view" && <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Nro de Venta</Text>
              <Text fontWeight="medium">{saleForm.sale.saleNumber}</Text>
            </Flex>}
            {/* <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Fecha</Text>
              <Text fontWeight="medium">{saleForm.sale.date}</Text>
            </Flex> */}
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Caja N°</Text>
              <Text fontWeight="medium">{saleForm.sale.cashierNumber}</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.100" my={1} />
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Subtotal</Text>
              <Text>{formatCurrency(saleForm.totals.subtotal)}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">IVA</Text>
              <Text>{formatCurrency(saleForm.totals.iva)}</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.200" my={1} />
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Total</Text>
              <Text color="green.600">{formatCurrency(saleForm.totals.total)}</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Importe</Text>
              <Text color="green.600">{formatCurrency(saleForm.totals.amount)}</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Vuelto</Text>
              <Text color="green.600">{formatCurrency(saleForm.totals.change)}</Text>
            </Flex>
          </Box>
        </Box>
      </Box>

      <Flex mt={4} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
        <Flex gap={4} align="center">
          <Text fontSize="3xl" fontWeight="bold">
            Total a pagar: <Text as="span" color="green.600">{formatCurrency(saleForm.totals.total)}</Text>
          </Text>
        </Flex>

        {mode === "create" && <Flex gap={3}>
          <DestructiveActionDialog
            title="Cancelar Venta"
            description="¿Estás seguro de que deseas cancelar esta venta? Se perderán todos los datos ingresados."
            onAccept={() => {
              setSelectedClient("Ninguno");
              setSaleForm(getSaleTemplate());
              setDialogAmount(0);
            }}
            trigger={
              <Button variant="surface" size="lg">
                Cancelar
              </Button>
            }
          />

          <ConfirmActionDialog
            title="Confirmar Venta"
            description="¿Estás seguro de que deseas generar esta venta?"
            onAccept={() => {
              if(!isAmountValid){
                toaster.create({title:"Monto del importe es menor que el precio a pagar",type: "error"})
                return;
              }
              createSale.mutate(saleForm)
            }}
            trigger={
              <IconButton 
                bg="brand.primary" 
                padding={4} 
                size="lg" 
                color="white" 
                ref={triggerRef} 
                disabled={saleForm.products.length === 0 || createSale.isPending }
              >
                {createSale.isPending ? <Spinner/> : <CircleDollarSign />} Generar Venta
              </IconButton>
            }
          >
            <Box mt={4}>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Ingresar el importe del cliente.
              </Text>
              <NumberInput.Root
                value={dialogAmount.toString()}
                onValueChange={(e) => {
                  const val = Number(e.value);
                  setDialogAmount(isNaN(val) ? 0 : val);
                }}
              >
                <NumberInput.Input onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }} />
              </NumberInput.Root>
              <Text
                fontSize="lg"
                fontStyle="bold"
                fontWeight="medium"
                color={isAmountValid ? "green.600" : "red.400"}
                mt={3}
              >
                {isAmountValid ? (
                  `Vuelto: ${formatCurrency(dialogAmount - saleForm.totals.total)}`
                ) : (
                  `Faltan: ${formatCurrency(saleForm.totals.total - dialogAmount)}`
                )}
              </Text>
            </Box>
          </ConfirmActionDialog>
        </Flex>}
      </Flex>
    </Box>
  );
}