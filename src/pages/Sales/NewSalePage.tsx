import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { SearchProductsDialog } from "@/components/ui/dialogs/search-products-dialog";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Table,
  Stack,
  Select,
  RadioGroup,
  createListCollection,
  EmptyState,
  VStack,
  Kbd,
  IconButton,
  NumberInput,
} from "@chakra-ui/react";
import { CircleDollarSign, PackageOpenIcon, Plus, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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
  const [clientName, setClientName] = useState("");
  const [rucNumber, setRucNumber] = useState("");
  const [rucDigit, setRucDigit] = useState<string>("");
  const isClientSelected = selectedClient !== "ninguno";
  const isClientEditable = !isClientSelected;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const addProdRef = useRef<HTMLButtonElement>(null);

  useHotkeys("ctrl+enter", () => {
    triggerRef.current?.click();
  });

  useHotkeys("ctrl+i", () => {
    addProdRef.current?.click();
  });

  return (
    <Box p={2}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Nueva Venta (N° XXXX)
        </Text>
        <Flex align="center" gap={3}>
          <Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
          <Input value="001 - 001 - 00000001" w="170px" size="sm" readOnly />
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
            onValueChange={setSelectedClient}
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
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            readOnly={!isClientEditable}
            bg={!isClientEditable ? "gray.50" : "white"}
          />
        </Box>

        <Box flex={2} minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
          <Flex gap={2}>
            <Input
              w="140px"
              size="sm"
              value={rucNumber}
              placeholder="0000000"
              onChange={(e) => setRucNumber(e.target.value.slice(0, 7))}
              readOnly={!isClientEditable}
              bg={!isClientEditable ? "gray.50" : "white"}
            />
            <Text fontSize="sm" fontWeight="bold" alignSelf="center">-</Text>
            <NumberInput.Root
              defaultValue="DV"
              min={0}
              max={9}
              value={rucDigit}

              w="32px"
              bg={!isClientEditable ? "gray.50" : "white"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  setRucDigit('');
                } else {
                  const numValue = Number(inputValue);
                  if (numValue >= 0 && numValue <= 9) {
                    setRucDigit(inputValue);
                  } else {
                    setRucDigit('9');
                  }
                }
              }}
              size="sm"
            >
              <NumberInput.Input />
            </NumberInput.Root>
          </Flex>
        </Box>
        <Box minW="130px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Método Pago</Text>
          <MySelect
            defaultValue="efectivo"
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
          <MyRadioGroup defaultValue="contado" />
        </Box>
      </Flex>

      <Flex gap={6} h="full" align="flex-start">
        <Box flex={1}>
          <Box display="flex" flexDirection="row" gap={3}><Input placeholder="Insertar código de producto" mb={3} size="sm" />
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
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>

        <Box
          w="260px"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="white"
          h="full"
        >
          <Stack gap={3} h="full" justify="space-between" >
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Nro de Venta</Text>
              <Text fontWeight="medium">2312</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Fecha</Text>
              <Text fontWeight="medium">01/01/2026</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Caja N°</Text>
              <Text fontWeight="medium">03</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.100" my={1} />
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">Subtotal</Text>
              <Text>0 GS.</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">IVA (10%)</Text>
              <Text>0 GS.</Text>
            </Flex>
            <Box borderTop="1px solid" borderColor="gray.200" my={1} />
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Total</Text>
              <Text color="green.600">0 GS.</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Importe</Text>
              <Text color="green.600">0 GS.</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Vuelto</Text>
              <Text color="green.600">0 GS.</Text>
            </Flex>
          </Stack>
        </Box>
      </Flex>

      {/* Total y acciones */}
      <Flex mt={4} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
        <Flex gap={4} align="center">
          <Text fontSize="3xl" fontWeight="bold">
            Total a pagar: <Text as="span" color="green.600">0 GS.</Text>
          </Text>

        </Flex>

        <Flex gap={3}>
          <DestructiveActionDialog title="Cancelar venta" description="¿Estás seguro de que deseas cancelar esta venta? Se perderán todos los datos ingresados."
            onAccept={() => { }}
            trigger={
              <Button variant="outline" size="lg" colorPalette="red">
                Cancelar
              </Button>
            } />

          <ConfirmActionDialog
            title="Confirmar venta"
            description="¿Estás seguro de que deseas generar esta venta?"
            onAccept={() => { }}

            trigger={
              <IconButton bg="brand.primary" padding={4} size="lg" color="white" ref={triggerRef}>
                <CircleDollarSign /> Generar Venta
              </IconButton>
            }
            children={
              <Box mt={4}>
                <Text fontSize="sm" fontStyle="italic" color="gray.600">
                  Ingresar el importe del cliente.
                </Text>
                <NumberInput.Root
                  defaultValue="0"
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
            }
          />
        </Flex>
      </Flex>
    </Box>
  );
}