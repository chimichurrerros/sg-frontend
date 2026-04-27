import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Stack,
  IconButton,
  NumberInput,
} from "@chakra-ui/react";
import { CircleDollarSign, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { paymentOptions, saleConditionOptions, type PaymentMethod, type Sale, type SaleCondition } from "@/types/sales.ts";
import ProductsTable from "./components/ProductsTable";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { RadioGroupWrapper } from "@/components/ui/radio-group-wrapper";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";

const SALE_TEMPLATE: Sale = {
  customer: {
    name: "",
    ruc: { number: "", dv: "" }
  },
  sale: {
    date: new Date().toLocaleDateString(),
    cashierNumber: 3
  },
  pay: {
    method: "Efectivo",
    condition: "Contado"
  },
  products: [],
  totals: {
    subtotal: 0,
    iva: 5,
    total: 0,
    amount: 0,
    change: 0,
  }
}

export default function NewSalePage() {
  const [selectedClient, setSelectedClient] = useState("Ninguno");
  const [saleForm, setSaleForm] = useState<Sale>(SALE_TEMPLATE);

  const triggerRef = useRef<HTMLButtonElement>(null);

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
          ruc: {
            number: "",
            dv: "",
          },
        },
      });
    } else {
      const clientData: Record<string, { name: string; ruc: string; digit: string }> = {
        juan: { name: "Juan Pérez", ruc: "1234567", digit: "8" },
        maria: { name: "María Gómez", ruc: "2345678", digit: "9" },
        carlos: { name: "Carlos López", ruc: "3456789", digit: "0" },
      };
      const client = clientData[value];
      if (client) {
        setSaleForm({
          ...saleForm,
          customer: {
            name: client.name,
            ruc: {
              number: client.ruc,
              dv: client.digit,
            },
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

  const updateRucNumber = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 7) {
      setSaleForm({
        ...saleForm,
        customer: {
          ...saleForm.customer,
          ruc: {
            ...saleForm.customer.ruc,
            number: value,
          },
        },
      });
    }
  };

  const updateRucDigit = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      setSaleForm({
        ...saleForm,
        customer: {
          ...saleForm.customer,
          ruc: {
            ...saleForm.customer.ruc,
            dv: value,
          },
        },
      });
    }
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

  const updateAmount = (value: string) => {
    const amountNum = parseFloat(value) || 0;
    const change = amountNum - saleForm.totals.total;
    setSaleForm({
      ...saleForm,
      totals: {
        ...saleForm.totals,
        amount: amountNum,
        change: change > 0 ? change : 0,
      },
    });
  };

  const isClientEditable = selectedClient === "Ninguno";

  return (
    <Box p={2}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Nueva Venta {saleForm.sale.saleNumber && `(N° ${saleForm.sale.saleNumber})`}
        </Text>
        <Flex align="center" gap={3}>
          <Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
          <Input value={saleForm.sale.bill?.number || "-"} w="170px" size="sm" readOnly />
          <IconButton size="md" padding={4} variant="outline">
            <Printer /> Imprimir Factura Legal
          </IconButton>
        </Flex>
      </Flex>

      <Flex gap={4} align="flex-end" mb={6} wrap="wrap">
        <Box flex={2} minW="200px">
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

        <Box flex={3} minW="200px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Nombre/Razón Social</Text>
          <Input
            size="sm"
            value={saleForm.customer.name}
            onChange={(e) => updateCustomerName(e.target.value)}
            readOnly={!isClientEditable}
            bg={!isClientEditable ? "gray.100" : "white"}
          />
        </Box>

        <Box flex={2} minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
          <Flex gap={2}>
            <Input
              w="140px"
              size="sm"
              value={saleForm.customer.ruc.number}
              placeholder="0000000"
              onChange={(e) => updateRucNumber(e.target.value)}
              readOnly={!isClientEditable}
              bg={!isClientEditable ? "gray.100" : "white"}
            />
            <Text fontSize="sm" fontWeight="bold" alignSelf="center">-</Text>
            <Input
              w="50px"
              size="sm"
              value={saleForm.customer.ruc.dv}
              placeholder="DV"
              onChange={(e) => updateRucDigit(e.target.value)}
              readOnly={!isClientEditable}
              bg={!isClientEditable ? "gray.100" : "white"}
              maxLength={1}
            />
          </Flex>
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

      <Flex gap={6} h="full" align="flex-start">
        <ProductsTable products={saleForm.products} />
        <Box
          w="260px"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="white"
          h="full"
        >
          <Stack gap={3} h="full" justify="space-between">
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Nro de Venta</Text>
              <Text fontWeight="medium">{saleForm.sale.saleNumber}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Fecha</Text>
              <Text fontWeight="medium">{saleForm.sale.date}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Caja N°</Text>
              <Text fontWeight="medium">{saleForm.sale.cashierNumber}</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.100" my={1} />
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Subtotal</Text>
              <Text>{saleForm.totals.subtotal.toLocaleString()} GS.</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">IVA (10%)</Text>
              <Text>{saleForm.totals.iva.toLocaleString()} GS.</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.200" my={1} />
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Total</Text>
              <Text color="green.600">{saleForm.totals.total.toLocaleString()} GS.</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Importe</Text>
              <Text color="green.600">{saleForm.totals.amount.toLocaleString()} GS.</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Vuelto</Text>
              <Text color="green.600">{saleForm.totals.change.toLocaleString()} GS.</Text>
            </Flex>
          </Stack>
        </Box>
      </Flex>

      <Flex mt={4} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
        <Flex gap={4} align="center">
          <Text fontSize="3xl" fontWeight="bold">
            Total a pagar: <Text as="span" color="green.600">{saleForm.totals.total.toLocaleString()} GS.</Text>
          </Text>
        </Flex>

        <Flex gap={3}>
          <DestructiveActionDialog
            title="Cancelar Venta"
            description="¿Estás seguro de que deseas cancelar esta venta? Se perderán todos los datos ingresados."
            onAccept={() => {
              setSelectedClient("Ninguno");
              setSaleForm(SALE_TEMPLATE);
            }}
            trigger={
              <Button variant="outline" size="lg" colorPalette="red">
                Cancelar
              </Button>
            }
          />

          <ConfirmActionDialog
            title="Confirmar Venta"
            description="¿Estás seguro de que deseas generar esta venta?"
            onAccept={() => {
              console.log("Venta confirmada:", saleForm);
            }}
            trigger={
              <IconButton bg="brand.primary" padding={4} size="lg" color="white" ref={triggerRef}>
                <CircleDollarSign /> Generar Venta
              </IconButton>
            }
          >
            <Box mt={4}>
              <Text fontSize="sm" fontStyle="italic" color="gray.600">
                Ingresar el importe del cliente.
              </Text>
              <NumberInput.Root
                value={saleForm.totals.amount.toString()}
                onValueChange={(e) => updateAmount(e.value)}
                formatOptions={{
                  style: "currency",
                  currency: "PYG",
                  currencyDisplay: "code",
                  currencySign: "accounting",
                }}
              >
                <NumberInput.Input />
              </NumberInput.Root>
            </Box>
          </ConfirmActionDialog>
        </Flex>
      </Flex>
    </Box>
  );
}