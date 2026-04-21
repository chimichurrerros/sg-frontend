import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Stack,
  Select,
  RadioGroup,
  createListCollection,

  IconButton,
  NumberInput,
} from "@chakra-ui/react";
import { CircleDollarSign,  Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type {  VentaForm } from "@/types/types.ts";
import ProductsTable from "./components/ProductsTable";

function MySelect({
  placeholder,
  options,
  width = "200px",
  defaultValue,
  value,
  onValueChange,
}: {
  placeholder?: string;
  options: { label: string; value: string }[];
  width?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const collection = createListCollection({
    items: options.map((opt) => ({
      label: opt.label,
      value: opt.value,
    })),
  });

  const selectedValue = value ? [value] : defaultValue ? [defaultValue] : undefined;

  return (
    <Select.Root
      collection={collection}
      value={selectedValue}
      onValueChange={(e) => onValueChange?.(e.value[0])}
      width={width}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.items.map((item) => (
            <Select.Item item={item} key={item.value}>
              {item.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}

function MyRadioGroup({
  defaultValue,
  value,
  onValueChange,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <RadioGroup.Root
      value={value || defaultValue}
      onValueChange={(e: any) => onValueChange?.(e.value)}
    >
      <Stack direction="row" gap={4}>
        <RadioGroup.Item value="contado">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemIndicator />
          <RadioGroup.ItemText>Contado</RadioGroup.ItemText>
        </RadioGroup.Item>

        <RadioGroup.Item value="credito">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemIndicator />
          <RadioGroup.ItemText>Crédito</RadioGroup.ItemText>
        </RadioGroup.Item>
      </Stack>
    </RadioGroup.Root>
  );
}

export default function NewSalePage() {
  const [selectedClient, setSelectedClient] = useState("ninguno");
  const [ventaForm, setVentaForm] = useState<VentaForm>({
    cliente: {
      nombreRazonSocial: "",
      ruc: {
        numero: "",
        digitoVerificador: "",
      },
    },
    venta: {
      numeroFactura: "001 - 001 - 00000001",
      numeroVenta: 2312,
      fecha: new Date(),
      cajaNumero: 3,
    },
    pago: {
      metodo: "efectivo",
      condicion: "contado",
    },
    productos: [],
    totales: {
      subtotal: 0,
      iva: 0,
      total: 0,
      importe: 0,
      vuelto: 0,
    },
  });

  const triggerRef = useRef<HTMLButtonElement>(null);

  useHotkeys("ctrl+enter", () => {
    triggerRef.current?.click();
  });



  const handleClientSelect = (value: string) => {
    setSelectedClient(value);
    if (value === "ninguno") {
      setVentaForm({
        ...ventaForm,
        cliente: {
          nombreRazonSocial: "",
          ruc: {
            numero: "",
            digitoVerificador: "",
          },
        },
      });
    } else {
      const clientData: Record<string, { nombre: string; ruc: string; digito: string }> = {
        juan: { nombre: "Juan Pérez", ruc: "1234567", digito: "8" },
        maria: { nombre: "María Gómez", ruc: "2345678", digito: "9" },
        carlos: { nombre: "Carlos López", ruc: "3456789", digito: "0" },
      };
      const client = clientData[value];
      if (client) {
        setVentaForm({
          ...ventaForm,
          cliente: {
            nombreRazonSocial: client.nombre,
            ruc: {
              numero: client.ruc,
              digitoVerificador: client.digito,
            },
          },
        });
      }
    }
  };

  const updateClienteNombre = (value: string) => {
    setVentaForm({
      ...ventaForm,
      cliente: {
        ...ventaForm.cliente,
        nombreRazonSocial: value,
      },
    });
  };

  const updateRucNumero = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 7) {
      setVentaForm({
        ...ventaForm,
        cliente: {
          ...ventaForm.cliente,
          ruc: {
            ...ventaForm.cliente.ruc,
            numero: value,
          },
        },
      });
    }
  };

  const updateRucDigito = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      setVentaForm({
        ...ventaForm,
        cliente: {
          ...ventaForm.cliente,
          ruc: {
            ...ventaForm.cliente.ruc,
            digitoVerificador: value,
          },
        },
      });
    }
  };

  const updateMetodoPago = (value: string) => {
    setVentaForm({
      ...ventaForm,
      pago: {
        ...ventaForm.pago,
        metodo: value as "efectivo" | "tarjeta" | "transferencia",
      },
    });
  };

  const updateCondicionVenta = (value: string) => {
    setVentaForm({
      ...ventaForm,
      pago: {
        ...ventaForm.pago,
        condicion: value as "contado" | "credito",
      },
    });
  };

  const updateImporte = (value: string) => {
    const importeNum = parseFloat(value) || 0;
    const vuelto = importeNum - ventaForm.totales.total;
    setVentaForm({
      ...ventaForm,
      totales: {
        ...ventaForm.totales,
        importe: importeNum,
        vuelto: vuelto > 0 ? vuelto : 0,
      },
    });
  };

  const isClientEditable = selectedClient === "ninguno";

  return (
    <Box p={2}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Nueva Venta (N° XXXX)
        </Text>
        <Flex align="center" gap={3}>
          <Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
          <Input value={ventaForm.venta.numeroFactura} w="170px" size="sm" readOnly />
          <IconButton size="md" padding={4} variant="outline">
            <Printer /> Imprimir Factura Legal
          </IconButton>
        </Flex>
      </Flex>

      <Flex gap={4} align="flex-end" mb={6} wrap="wrap">
        <Box flex={2} minW="200px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Cargar Cliente</Text>
          <MySelect
            placeholder="Seleccionar cliente"
            value={selectedClient}
            onValueChange={handleClientSelect}
            options={[
              { label: "Ninguno", value: "ninguno" },
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
            value={ventaForm.cliente.nombreRazonSocial}
            onChange={(e) => updateClienteNombre(e.target.value)}
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
              value={ventaForm.cliente.ruc.numero}
              placeholder="0000000"
              onChange={(e) => updateRucNumero(e.target.value)}
              readOnly={!isClientEditable}
              bg={!isClientEditable ? "gray.100" : "white"}
            />
            <Text fontSize="sm" fontWeight="bold" alignSelf="center">-</Text>
            <Input
              w="50px"
              size="sm"
              value={ventaForm.cliente.ruc.digitoVerificador}
              placeholder="DV"
              onChange={(e) => updateRucDigito(e.target.value)}
              readOnly={!isClientEditable}
              bg={!isClientEditable ? "gray.100" : "white"}
              maxLength={1}
            />
          </Flex>
        </Box>

        <Box minW="130px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Método Pago</Text>
          <MySelect
            value={ventaForm.pago.metodo}
            onValueChange={updateMetodoPago}
            options={[
              { label: "Efectivo", value: "efectivo" },
              { label: "Tarjeta", value: "tarjeta" },
              { label: "Transferencia", value: "transferencia" },
            ]}
            width="100%"
          />
        </Box>

        <Box minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Condición Venta</Text>
          <MyRadioGroup 
            value={ventaForm.pago.condicion}
            onValueChange={updateCondicionVenta}
          />
        </Box>
      </Flex>

      <Flex gap={6} h="full" align="flex-start">
        <ProductsTable products={ventaForm.productos}/>
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
              <Text fontWeight="medium">{ventaForm.venta.numeroVenta}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Fecha</Text>
              <Text fontWeight="medium">{ventaForm.venta.fecha.toLocaleDateString()}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Caja N°</Text>
              <Text fontWeight="medium">{ventaForm.venta.cajaNumero}</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.100" my={1} />
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Subtotal</Text>
              <Text>{ventaForm.totales.subtotal.toLocaleString()} GS.</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">IVA (10%)</Text>
              <Text>{ventaForm.totales.iva.toLocaleString()} GS.</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.200" my={1} />
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Total</Text>
              <Text color="green.600">{ventaForm.totales.total.toLocaleString()} GS.</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Importe</Text>
              <Text color="green.600">{ventaForm.totales.importe.toLocaleString()} GS.</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Vuelto</Text>
              <Text color="green.600">{ventaForm.totales.vuelto.toLocaleString()} GS.</Text>
            </Flex>
          </Stack>
        </Box>
      </Flex>

      <Flex mt={4} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
        <Flex gap={4} align="center">
          <Text fontSize="3xl" fontWeight="bold">
            Total a pagar: <Text as="span" color="green.600">{ventaForm.totales.total.toLocaleString()} GS.</Text>
          </Text>
        </Flex>

        <Flex gap={3}>
          <DestructiveActionDialog 
            title="Cancelar venta" 
            description="¿Estás seguro de que deseas cancelar esta venta? Se perderán todos los datos ingresados."
            onAccept={() => {
              setSelectedClient("ninguno");
              setVentaForm({
                cliente: {
                  nombreRazonSocial: "",
                  ruc: {
                    numero: "",
                    digitoVerificador: "",
                  },
                },
                venta: {
                  numeroFactura: "001 - 001 - 00000001",
                  numeroVenta: 2312,
                  fecha: new Date(),
                  cajaNumero: 3,
                },
                pago: {
                  metodo: "efectivo",
                  condicion: "contado",
                },
                productos: [],
                totales: {
                  subtotal: 0,
                  iva: 0,
                  total: 0,
                  importe: 0,
                  vuelto: 0,
                },
              });
            }}
            trigger={
              <Button variant="outline" size="lg" colorPalette="red">
                Cancelar
              </Button>
            } 
          />

          <ConfirmActionDialog
            title="Confirmar venta"
            description="¿Estás seguro de que deseas generar esta venta?"
            onAccept={() => {
              console.log("Venta confirmada:", ventaForm);
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
                value={ventaForm.totales.importe.toString()}
                onValueChange={(e) => updateImporte(e.value)}
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