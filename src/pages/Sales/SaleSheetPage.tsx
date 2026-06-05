import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  IconButton,
  Spinner,
  InputGroup
} from "@chakra-ui/react";
import { ArrowLeft, CircleDollarSign, ExternalLink, HandHelpingIcon, Printer, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { paymentOptions, saleConditionOptions, type PaymentMethod, type ProductSaleDTO, type Sale, type SaleCondition } from "@/types/sales.ts";
import ProductsTable from "./components/ProductsTable";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { RadioGroupWrapper } from "@/components/ui/wrappers/radio-group-wrapper";
import { ComboboxWrapper } from "@/components/ui/wrappers/combobox-wrapper";
import { type EditableLabel } from "@/components/ui/tables/table-edit";
// import { parseDate } from "@/constants/date";
import { paymentMethods, saleConditions, useCreateSale, useGetSaleById } from "@/queries/sales.queries";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import { useGetAllCustomers } from "@/queries/customers.queries";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { parseDate } from "@/constants/date";
import { useAllBranches } from "@/queries/branches.queries";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";
import { useAuthStore } from "@/stores/auth.store";
import PageTitle from "@/components/ui/title";

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
    importValue: 0,
    change: 0,
  }
});

interface saleSheetProps {
  mode: "view" | "create"
}
export function isValidRuc(ruc: string) {
  const rucRegex = /^\d{6,8}-\d$/;
  return rucRegex.test(ruc) || ruc === "";
}

export default function SaleSheetPage({ mode }: saleSheetProps) {
  const [selectedClient, setSelectedClient] = useState("Ninguno");
  const [saleForm, setSaleForm] = useState<Sale>(getSaleTemplate());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const createSale = useCreateSale();
  const { id } = useParams();
  const { data: sale, isPending: loadingSale, isError: isErrorSale, error: saleError } = useGetSaleById(Number(id), mode === "view");
  // const [saveCustomer, setSaveCustomer] = useState(false);
  const { data: customers, isPending: loadingCustomers, isError: isErrorCustomers, error: errorCustomers } = useGetAllCustomers(mode === "create");
  const user = useAuthStore((s) => s.user);
  const branchId = user?.branchId ?? null;
  const { data: branches, isPending: loadingBranches, isError: isErrorBranches, error: errorBranches } = useAllBranches();
  const [dialogAmount, setDialogAmount] = useState(0);
  const [displayValue, setDisplayValue] = useState(parsePrice(dialogAmount));
  const navigate = useNavigate();

  useEffect(() => {
    if (isErrorBranches) {
      toaster.create({ title: "Error al cargar las sucursales", description: errorBranches.message || "Error desconocido", type: "error" })
    }

  }, [isErrorBranches, errorBranches])

  useEffect(() => {
    if (mode === "create" && branchId) {
      setSaleForm(prev => ({ ...prev, sale: { ...prev.sale, branchId } }));
    }
  }, [branchId]);

  useEffect(() => {
    if (mode === "view") return;
    const subtotal = saleForm.products.reduce((sum, p) => sum + (p.total || 0), 0);
    const total = subtotal;
    const change = dialogAmount >= total ? dialogAmount - total : 0;

    setSaleForm(prev => ({
      ...prev,
      totals: {
        ...prev.totals,
        subtotal,
        total,
        importValue: dialogAmount,
        change,
      }
    }));
  }, [saleForm.products, dialogAmount]);

  useEffect(() => {
    if (isErrorCustomers) {
      toaster.create({ title: "Error al cargar los clientes", description: errorCustomers.message || "Error desconocido", type: "error" })
    }
  }, [isErrorCustomers, errorCustomers])
  useEffect(() => {
    if (!sale || mode !== "view") return;
    setSaleForm({
      customer: {
        name: sale.customerName || "",
        ruc: sale.customerRuc || "",
        email: sale.customerEmail || "",
        birthDate: sale.customerBirthDate || ""
      },
      sale: {
        date: parseDate(sale.date),
        cashierNumber: 0,
        saleNumber: sale.id,
        bill: sale.bills[0],
        branchId: sale.branchId
      },
      pay: {
        method: paymentMethods[sale.paymentMethod],
        condition: saleConditions[sale.saleCondition]
      },
      products: sale.details.map((d) => ({
        id: d.productId,
        name: d.productName,
        barcode: d.barcode,
        description: d.description,
        price: d.price,
        quantity: d.quantityOrdered,
        total: d.price * d.quantityOrdered,
        taxRate: d.taxRate,
        stock: 0,
      })),
      totals: {
        subtotal: sale.total - sale.bills[0].taxTotal,
        iva: sale.bills[0].taxTotal,
        total: sale.total,
        importValue: sale.importValue,
        change: sale.importValue - (sale.total - sale.bills[0].taxTotal)
      }
    });
  }, [sale, mode]);
  useEffect(() => {
    if (mode === "create") {
      setSaleForm(getSaleTemplate());
      setSelectedClient("Ninguno");
      setDialogAmount(0);
      setDisplayValue("");
    }
  }, [mode]);

  const productsLabel: EditableLabel<ProductSaleDTO>[] = [
    { labelName: "Código", propName: "barcode", textIfNull: "-" },
    { labelName: "Nombre", propName: "name", textIfNull: "Producto sin nombre", isSortable: true, sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => (a.name || "").localeCompare(b.name || "") },
    {
      labelName: "Descripción", propName: "description",
      textIfNull: "Sin Descripción",
      formatFunction: (d: string) => d && d.length > 35 ? d.slice(0, 35) + "..." : d
    },

    {
      labelName: "Cantidad", propName: "quantity",
      isEditable: true, inputType: "number",
      validate: (value: number | string, item?: ProductSaleDTO) => Number(value) > 0 && Number(value) <= (item?.stock || 0),
      transform: (value: string) => Number(value),
      onEdit: (item: ProductSaleDTO, newValue: string | number | null | undefined) => { if (!newValue) return item; return { ...item, quantity: Number(newValue), total: item.price * Number(newValue) } }
    },
    { labelName: "Precio Unitario", propName: "price", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => a.price - b.price, },
    { labelName: "Total", propName: "total", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => (a.total || 0) - (b.total || 0), textIfNull: "0" },
    { labelName: "IVA", propName: "taxRate", formatFunction: (value) => String(value) + "%" }
  ];
  if (mode === "create") {
    productsLabel.push({
      labelName: "", isComponent: true, render: (item: ProductSaleDTO) =>
        <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => setSaleForm({ ...saleForm, products: saleForm.products.filter((p: ProductSaleDTO) => p.id !== item.id) })}>
          <X />
        </IconButton>
    })
  }
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
          email: undefined,
          birthDate: undefined
        },
      });
    } else {
      const customer = customers?.find(c => c.id === Number(value));
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
  const updateCustomerEmail = (value: string) => {
    setSaleForm({
      ...saleForm,
      customer: {
        ...saleForm.customer,
        email: value,
      },
    });
  };
  const updateCustomerBirthdate = (value: string) => {
    setSaleForm({
      ...saleForm,
      customer: {
        ...saleForm.customer,
        birthDate: value,
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

  // const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const formattedRuc = e.target.value;
  //   setSaleForm({
  //     ...saleForm,
  //     customer: {
  //       ...saleForm.customer,
  //       ruc: formattedRuc
  //     }
  //   });
  // };


  const isAmountValid = dialogAmount >= saleForm.totals.total;
  if (loadingSale && mode !== "create") {
    return <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
      <LoadingScreen message="Cargando Venta..." /> </Box>
  }

  if (isErrorSale) {
    return <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
      <ErrorScreen title="Error al cargar la venta" errorMessage={saleError.message || "Error desconocido"} /></Box>
  }
  return (
    <Box height="89vh" display="flex" flexDirection="column">
      <Flex justify="space-between" alignItems="center" justifyContent="space-between" mb={2} flexShrink={0}>
        <Box display="flex" gap={1} flexDirection={"column"}>
          <PageTitle>{mode === "create" && "Nueva"} Venta {saleForm.sale.saleNumber ? `N°${saleForm.sale.saleNumber}` : ""}</PageTitle>
          {mode === "view" && <Text fontSize="lg" fontWeight="bold" color="gray.600"> | Realizada el:  {parseDate(sale?.date)}</Text>}
        </Box>

        <Flex align="center" gap={3}>
          <Flex align="flex-end" gap={3}>
            <IconButton size="md" padding={4} variant="outline" onClick={() => navigate("/ventas/listado")}>
              <ArrowLeft /> Volver al listado
            </IconButton>
            {mode === "view" && <IconButton size="md" padding={4} variant="surface" colorPalette={"yellow"} onClick={() => navigate("/ventas/devoluciones/desde/" + sale.id)}>
              <HandHelpingIcon /> Registrar Devolución
            </IconButton>}

            {mode === "view" && (
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Text fontWeight="bold" fontSize="sm" color="gray.600" whiteSpace="nowrap" mb={1}>FACTURA N°</Text>
                <InputGroup endElement={
                  <IconButton size="xs" variant="ghost" onClick={() => navigate(`/ventas/facturas/${sale?.bills[0]?.id}`)}>
                    <ExternalLink size={16} />
                  </IconButton>
                }>
                  <Input
                    value={saleForm.sale.bill ? saleForm.sale.bill.number : "-"}
                    w="180px"
                    size="md"
                    readOnly
                    pr="2.5rem"
                  />
                </InputGroup>
              </Box>
            )}
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              {mode === "view" && <Text fontWeight="bold" fontSize="md" color="gray.600" whiteSpace="nowrap" mb={1}>
                Sucursal: {branches?.branches.find(b => b.id == saleForm.sale.branchId)?.name || " "}
                {loadingBranches && <Spinner size="sm" />}
              </Text>}
              <IconButton size="md" padding={4} variant="outline" disabled={mode === "create"}>
                <Printer /> Imprimir Factura Legal
              </IconButton>
            </Box>
          </Flex>

        </Flex>
      </Flex>
      <Flex gap={4} align="flex-end" mb={2} wrap="wrap" justifyContent="space-between" flexShrink={0}>
        {mode === "create" && (
          <Box flex={1.5} minW="180px">
            <Text fontSize="xs" fontWeight="medium" color="gray.600">
              Cargar Cliente {loadingCustomers && <Spinner size="sm" ml={2} />}
            </Text>
            <ComboboxWrapper
              placeholder="Buscar cliente..."
              value={selectedClient}
              onValueChange={handleClientSelect}
              options={
                customers ? customers.map(c => ({ label: c.name, value: c.id.toString() })) : []
              }
              disabled={loadingCustomers}
              width="100%"
              clearable={true}
              onClear={() => {
                setSaleForm({ ...saleForm, customer: { ...saleForm.customer, name: "", ruc: "", email: undefined, birthDate: undefined } });
                setSelectedClient("Ninguno");
              }}
            />
          </Box>
        )}

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
            readOnly={!isClientEditable || mode === "view"}
            bg={!isClientEditable ? "gray.100" : "white"}
            placeholder="Nombre del cliente"
          />
        </Box>

        <Box flex={1.2} minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
          <Input
            size="md"
            placeholder="RUC del cliente"
            value={saleForm.customer.ruc}
            readOnly={!isClientEditable || mode === "view"}
            bg={!isClientEditable ? "gray.100" : "white"}
            maxLength={10}
            onChange={(e) => {
              const clean = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
              const formatted = clean.length > 1
                ? clean.slice(0, -1) + "-" + clean.slice(-1)
                : clean;
              setSaleForm({ ...saleForm, customer: { ...saleForm.customer, ruc: formatted } });
            }}
          />
        </Box>

        <Box flex={2} minW="180px">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="xs" fontWeight="medium" color="gray.600">Correo Electrónico</Text>
          </Flex>
          <Input
            size="md"
            value={saleForm.customer.email}
            onChange={(e) => updateCustomerEmail(e.target.value)}
            readOnly={!isClientEditable || mode === "view"}
            bg={!isClientEditable ? "gray.100" : "white"}
            placeholder="Email del cliente"
          />
        </Box>
        <Box flex={2} minW="180px">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="xs" fontWeight="medium" color="gray.600">Fecha de Nacimiento</Text>
          </Flex>
          <DatePickerWrapper
            value={saleForm.customer.birthDate}
            onChange={(dates: string[]) => updateCustomerBirthdate(dates[0])}
            readOnly={!isClientEditable || mode === "view"}
            placeholder="Fecha de nacimiento"

          />
        </Box>


        <Box minW="130px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Método de Pago</Text>
          <SelectWrapper
            value={saleForm.pay.method}
            onValueChange={updatePaymentMethod}
            options={paymentOptions}
            width="100%"
            readOnly={mode === "view"}

          />
        </Box>

        <Box minW="150px">
          <Text fontSize="xs" fontWeight="medium" color="gray.600">Condición de Venta</Text>
          <RadioGroupWrapper
            value={saleForm.pay.condition}
            onValueChange={updateSaleCondition}
            options={saleConditionOptions}
            disabled={mode === "view"}
          />
        </Box>
      </Flex>

      <Box flex="1" minHeight="0" >
        <ProductsTable
          products={saleForm.products}
          labels={productsLabel}
          readOnly={mode === "view"}
          branchId={branchId}
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
              <Text color="green.600">{parsePrice(saleForm.totals.importValue)}</Text>
            </Flex>
            <Flex justify="space-between" fontWeight="bold" fontSize="md">
              <Text>Vuelto</Text>
              <Text color="green.600">{parsePrice(saleForm.totals.change)}</Text>
            </Flex>
          </Box>
        </Box> */}
      </Box>

      <Flex flexShrink={0} mt={2} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
        <Flex gap={8} align="center">
          <Text fontSize="3xl" fontWeight="bold">
            {mode === "view" ? "Total pagado" : "Total a pagar"}:&nbsp;
            <Text as="span" color="green.600">{parsePrice(saleForm.totals.total)}</Text>
          </Text>

          {mode === "view" && (
            <Box display="flex" alignItems="center" gap={8} justifyContent="space-between">
              <Text color="gray.300" fontSize="3xl">|</Text>
              {saleForm.totals.importValue > saleForm.totals.total && <><Text fontSize="3xl" fontWeight="bold">
                Importe:&nbsp;
                <Text as="span" color="brand.primary">{parsePrice(saleForm.totals.importValue)}</Text>
              </Text>

                <Text color="gray.300" fontSize="3xl">|</Text>
                <Text fontSize="3xl" fontWeight="bold">
                  Vuelto:&nbsp;
                  <Text as="span" color="gray.500">{parsePrice(saleForm.totals.change)}</Text>
                </Text></>}
            </Box>
          )}
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
              createSale.mutate(saleForm, {
                onSuccess: () => {
                  setSelectedClient("Ninguno");
                  setSaleForm(getSaleTemplate());
                  setDialogAmount(0);
                }
              })
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