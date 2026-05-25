import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  IconButton,
  Spinner
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
// import { parseDate } from "@/constants/date";
import { useCreateSale } from "@/queries/sales.queries";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import { useGetAllCustomers } from "@/queries/customers.queries";

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
  // const [saveCustomer, setSaveCustomer] = useState(false);
  const { data: customers, isPending: loadingCustomers, isError: isErrorCustomers, error: errorCustomers } = useGetAllCustomers();

  const rucInputRef = useMask({
    mask: "nnnnnn-n",
    replacement: { n: /\d/ },
    showMask: true,
  });
  const [dialogAmount, setDialogAmount] = useState(0);
  const [displayValue, setDisplayValue] = useState(parsePrice(dialogAmount));
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

  useEffect(() => {
    if (isErrorCustomers) {
      toaster.create({ title: "Error al cargar los clientes", description: errorCustomers.message || "Error desconocido", type: "error" })
    }
  }, [isErrorCustomers, errorCustomers])
  const productsLabel: EditableLabel<ProductSaleDTO>[] = [
    { labelName: "Código", propName: "barcode", textIfNull: "-" },
    { labelName: "Nombre", propName: "name", textIfNull: "Producto sin nombre", isSortable: true, sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => (a.name || "").localeCompare(b.name || "") },
    {
      labelName: "Descripción", propName: "description",
      textIfNull: "Sin Descripción",
      transform: (d: string) => d && d.length > 35 ? d.slice(0, 35) + "..." : d
    },

    {
      labelName: "Cantidad", propName: "quantity",
      isEditable: true, inputType: "number",
      validate: (value: number | string, item?: ProductSaleDTO ) => Number(value) > 0 && ( item ? Number(value) <= item.minimumStock: true),
      transform: (value: string) => Number(value),
      onEdit: (item: ProductSaleDTO, newValue: string | number | null | undefined) => { if (!newValue) return item; return { ...item, quantity: Number(newValue), total: item.price * Number(newValue) } }
    },
    { labelName: "Precio Unitario", propName: "price", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => a.price - b.price, },
    { labelName: "Total", propName: "total", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => (a.total || 0) - (b.total || 0), textIfNull: "0" },
    { labelName: "IVA", propName:"taxRate", formatFunction:(value)=> String(value) +"%"},

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
      const customer = customers?.customers.find(c => c.id === Number(value));
      if (customer) {
        setSaleForm({
          ...saleForm,
          customer
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

function isValidRuc(ruc: string) {
    const rucRegex = /^\d{6}-\d$/;
    return rucRegex.test(ruc);
}
  const isAmountValid = dialogAmount >= saleForm.totals.total;

  return (
    <Box height="89vh" display="flex" flexDirection="column">
      <Flex justify="space-between" align="center" mb={2} flexShrink={0}>
        <Text fontSize="2xl" fontWeight="bold">
          {mode === "create" && "Nueva"} Venta {saleForm.sale.saleNumber ? `(N° ${saleForm.sale.saleNumber})` : ""}
        </Text>
        <Flex align="center" gap={3}>
          {mode === "view" && <><Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
            <Input value={saleForm.sale.bill ? saleForm.sale.bill.number : "-"} w="170px" size="sm" readOnly /> </>}
          <IconButton size="md" padding={4} variant="outline" disabled={mode === "create"}>
            <Printer /> Imprimir Factura Legal
          </IconButton>
        </Flex>
      </Flex>
      {/* <p>{JSON.stringify(saleForm.products)}</p> */}

      <Flex gap={4} align="flex-end" mb={2} wrap="wrap" justifyContent="space-between" flexShrink={0}>
        <Box flex={1.5} minW="180px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Cargar Cliente {loadingCustomers && <Spinner size="sm" ml={2} />}</Text>
          <ComboboxWrapper
            placeholder="Buscar cliente..."
            value={selectedClient}
            onValueChange={handleClientSelect}
            options={
              customers ? customers.customers.map(c => ({ label: c.name, value: c.id.toString() })) : []
            }
            disabled={loadingCustomers}
            width="100%"
            clearable={true}
          />
        </Box>

        <Box flex={2} minW="180px">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="xs" fontWeight="medium" color="gray.600">Nombre/Razón Social</Text>
            {/* {isClientEditable && mode === "create" && (
              <Checkbox.Root
                size="xs"
                checked={saveCustomer}
                onCheckedChange={(e) => setSaveCustomer(!!e.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="xs" color="gray.500">Guardar cliente</Text>
                </Checkbox.Label>
              </Checkbox.Root>
            )} */}
          </Flex>
          <Input
            size="md"
            value={saleForm.customer.name}
            onChange={(e) => updateCustomerName(e.target.value)}
            readOnly={!isClientEditable}
            bg={!isClientEditable ? "gray.100" : "white"}
            placeholder="Nombre del cliente"
          />
        </Box>

        <Box flex={1.2} minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
          <Input
            ref={rucInputRef}
            size="md"
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

      <Box flex="1" minHeight="0" >
        <ProductsTable
          products={saleForm.products}
          labels={productsLabel}
          readOnly={mode !== "create"}
          onDataChange={
            (newData: ProductSaleDTO[]) => {
              setSaleForm({
                ...saleForm,
                products: newData
              })
            }} />
        {/* Hidden by moment */}
        {/* <Box
          w="250px"
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
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Fecha</Text>
              <Text fontWeight="medium">{parseDate(saleForm.sale.date)}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Caja N°</Text>
              <Text fontWeight="medium">{saleForm.sale.cashierNumber}</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.100" my={1} />
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Subtotal</Text>
              <Text>{parsePrice(saleForm.totals.subtotal)}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">IVA</Text>
              <Text>{parsePrice(saleForm.totals.iva)}</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.200" my={1} />
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Total</Text>
              <Text color="green.600">{parsePrice(saleForm.totals.total)}</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Importe</Text>
              <Text color="green.600">{parsePrice(saleForm.totals.amount)}</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Vuelto</Text>
              <Text color="green.600">{parsePrice(saleForm.totals.change)}</Text>
            </Flex>
          </Box>
        </Box> */}
      </Box>

      <Flex flexShrink={0} mt={2} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
        <Flex gap={4} align="center">
          <Text fontSize="3xl" fontWeight="bold">
            Total a pagar: <Text as="span" color="green.600">{parsePrice(saleForm.totals.total)}</Text>
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
              if (!isAmountValid) {
                toaster.create({ title: "Monto del importe es menor que el precio a pagar", type: "error" })
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
                disabled={saleForm.products.length === 0 || createSale.isPending || !isValidRuc(saleForm.customer.ruc)}
              >
                {createSale.isPending ? <Spinner /> : <CircleDollarSign />} Generar Venta
              </IconButton>
            }
          >
            <Box mt={4}>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Ingresar el importe del cliente.
              </Text>
              <Input
                value={displayValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const val = raw === "" ? 0 : Number(raw);
                  setDialogAmount(val);
                  setDisplayValue(raw);
                }}
                onBlur={() => setDisplayValue(parsePrice(dialogAmount))}
                onFocus={() => setDisplayValue(dialogAmount === 0 ? "" : dialogAmount.toString())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              />
              <Text
                fontSize="lg"
                fontStyle="bold"
                fontWeight="medium"
                color={isAmountValid ? "green.600" : "red.400"}
                mt={3}
              >
                {isAmountValid ? (
                  `Vuelto: ${parsePrice(dialogAmount - saleForm.totals.total)}`
                ) : (
                  `Faltan: ${parsePrice(saleForm.totals.total - dialogAmount)}`
                )}
              </Text>
            </Box>
          </ConfirmActionDialog>
        </Flex>}
      </Flex>
    </Box>
  );
}