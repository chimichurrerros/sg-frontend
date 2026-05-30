// src/pages/Budgets/BudgetSheetPage.tsx
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
} from "@chakra-ui/react";
import { ArrowLeft, CalendarPlus, Printer, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { paymentOptions, saleConditionOptions, type PaymentMethod, type ProductSaleDTO, type SaleCondition } from "@/types/sales";
import ProductsTable from "../components/ProductsTable";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { RadioGroupWrapper } from "@/components/ui/radio-group-wrapper";
import { ComboboxWrapper } from "@/components/ui/combobox-wrapper";
import { type EditableLabel } from "@/components/ui/table-edit";
import { paymentMethodIds, paymentMethods, saleConditionIds, saleConditions } from "@/queries/sales.queries";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import { useGetAllCustomers } from "@/queries/customers.queries";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { useCustomerQuoteById, useCreateCustomerQuote } from "@/queries/customer-quotes.queries";
import type { CreateCustomerQuoteRequest, CustomerQuote } from "@/api/customer-quotes.api";
import { useAllBranches } from "@/queries/branches.queries";
import { parseDate } from "@/constants/date";

const getBudgetTemplate = (): CreateCustomerQuoteRequest => ({
    customer: {
        id: 0,
        name: "",
        ruc: "",
    },
    sale: {
        bill: 1,
        date: new Date(),
        branchId: 0,
        accountId: 0,
        movementType: 0,
    },
    pay: {
        method: 1,
        condition: 1,
    },
    products: [],
    totals: {
        subtotal: 0,
        iva: 0,
        total: 0,
        amount: 0,
        change: 0,
        importValue: 0,
    },
});

interface BudgetSheetPageProps {
    mode: "edit" | "create";
}

export default function BudgetSheetPage({ mode }: BudgetSheetPageProps) {
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [budgetForm, setBudgetForm] = useState<CreateCustomerQuoteRequest>(getBudgetTemplate());
    const triggerRef = useRef<HTMLButtonElement>(null);
    const createBudget = useCreateCustomerQuote();
    const { id } = useParams();
    const { data: budget, isPending: loadingBudget, isError: isErrorBudget, error: budgetError } = useCustomerQuoteById(Number(id), mode === "edit");
    const { data: customers, isPending: loadingCustomers, isError: isErrorCustomers, error: errorCustomers } = useGetAllCustomers(mode === "create");
    const [branchId, setBranchId] = useState<number | null>(null);
    const { data: branches, isPending: loadingBranches, isError: isErrorBranches, error: errorBranches } = useAllBranches();
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "edit") return;
        const subtotal = budgetForm.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const iva = subtotal * 0.1;
        const total = subtotal + iva;

        setBudgetForm(prev => ({
            ...prev,
            totals: {
                ...prev.totals,
                subtotal,
                iva,
                total,
                importValue: total,
            }
        }));
    }, [budgetForm.products, mode]);

    // Sincronizar branchId
    useEffect(() => {
        if (branchId) {
            setBudgetForm(prev => ({
                ...prev,
                sale: { ...prev.sale, branchId }
            }));
        }
    }, [branchId]);

    // Cargar datos del presupuesto cuando esté en modo vista
    useEffect(() => {
        if (!budget || mode !== "edit") return;

        setBudgetForm({
            customer: {
                id: budget.customerId,
                name: budget.customerName,
                ruc: budget.customerRuc,
            },
            sale: {
                bill: 1,
                date: new Date(budget.date),
                branchId: budget.branchId,
                accountId: 0,
                movementType: 0,
            },
            pay: {
                method: budget.paymentMethod,
                condition: budget.saleCondition,
            },
            products: budget.details.map((d) => ({
                productId: d.productId,
                barcode: "",
                description: d.description,
                productName: d.productName,
                quantity: d.quantity,
                price: d.price,
            })),
            totals: {
                subtotal: budget.total - (budget.total * 0.1),
                iva: budget.total * 0.1,
                total: budget.total,
                amount: budget.importValue,
                change: 0,
                importValue: budget.importValue,
            },
        });

        setSelectedClient(budget.customerId.toString());
    }, [budget, mode]);

    useEffect(() => {
        if (isErrorCustomers) {
            toaster.create({ title: "Error al cargar los clientes", description: errorCustomers?.message || "Error desconocido", type: "error" });
        }
    }, [isErrorCustomers, errorCustomers]);

    useEffect(() => {
        if (isErrorBranches) {
            toaster.create({ title: "Error al cargar las sucursales", description: errorBranches?.message || "Error desconocido", type: "error" });
        }
    }, [isErrorBranches, errorBranches]);

    let productsLabel: EditableLabel<ProductSaleDTO>[] = [

    ]
    if (mode === "create") { productsLabel.push({ labelName: "Código", propName: "barcode", textIfNull: "-" },) }
    productsLabel.push({ labelName: "Nombre", propName: "name", textIfNull: "Producto sin nombre", isSortable: true, sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => (a.name || "").localeCompare(b.name || "") })

    if (mode === "create") { productsLabel.push({ labelName: "Descripción", propName: "description", textIfNull: "Sin Descripción" }) }

    productsLabel = [...productsLabel,

        {
            labelName: "Cantidad", propName: "quantity",
            isEditable: true, inputType: "number",
            validate: (value: number | string) => Number(value) > 0,
            transform: (value: string) => Number(value),
            onEdit: (item: ProductSaleDTO, newValue: string | number | null | undefined) => {
                if (!newValue) return item;
                return { ...item, quantity: Number(newValue), total: item.price * Number(newValue) };
            }
        },
        { labelName: "Precio Unitario", propName: "price", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => a.price - b.price },
        { labelName: "Total", propName: "total", isSortable: true, formatFunction: (value) => parsePrice(value), sortFunction: (a: ProductSaleDTO, b: ProductSaleDTO) => (a.total || 0) - (b.total || 0), textIfNull: "0" },
    ];

    if (mode === "create") {
        productsLabel.push({
            labelName: "", isComponent: true, render: (item: ProductSaleDTO) =>
                <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => setBudgetForm({ ...budgetForm, products: budgetForm.products.filter((p) => p.productId !== item.id) })}>
                    <X />
                </IconButton>
        });
    }

    useHotkeys("ctrl+enter", () => {
        triggerRef.current?.click();
    });

    const handleClientSelect = (value: string) => {
        setSelectedClient(value);
        if (!value) {
            setBudgetForm(prev => ({
                ...prev,
                customer: { id: 0, name: "", ruc: "" },
            }));
        } else {
            const customer = customers?.find(c => c.id === Number(value));
            if (customer) {
                setBudgetForm(prev => ({
                    ...prev,
                    customer: { id: customer.id, name: customer.name, ruc: customer.ruc || "" },
                }));
            }
        }
    };

    const updateCustomerName = (value: string) => {
        setBudgetForm(prev => ({
            ...prev,
            customer: { ...prev.customer, name: value },
        }));
    };

    const updatePaymentMethod = (value: PaymentMethod) => {
        setBudgetForm(prev => ({
            ...prev,
            pay: { ...prev.pay, method: paymentMethodIds[value] },
        }));
    };

    const updateSaleCondition = (value: string) => {
        setBudgetForm(prev => ({
            ...prev,
            pay: { ...prev.pay, condition: saleConditionIds[value as SaleCondition] },
        }));
    };

    const isClientEditable = !selectedClient || selectedClient === "";

    const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedRuc = e.target.value;
        setBudgetForm(prev => ({
            ...prev,
            customer: { ...prev.customer, ruc: formattedRuc },
        }));
    };

    if (loadingBudget && mode !== "create") {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <LoadingScreen message="Cargando Presupuesto..." />
            </Box>
        );
    }

    if (isErrorBudget && mode !== "create") {
        return (
            <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
                <ErrorScreen title="Error al cargar el presupuesto" errorMessage={budgetError?.message || "Error desconocido"} />
            </Box>
        );
    }

    return (
        <Box height="89vh" display="flex" flexDirection="column">
            <Flex justify="space-between" alignItems="center" justifyContent="space-between" mb={2} flexShrink={0}>
                <Box display="flex" gap={3}>
                    <Text fontSize="2xl" fontWeight="bold">
                        {mode === "create" && "Nuevo"} Presupuesto {budget?.number ? `N° ${budget.number}` : ""}
                    </Text>
                    {mode === "edit" && budget?.date && (
                        <Text fontSize="2xl" fontWeight="bold" color="gray.600">
                            | Creado el:  {parseDate(new Date(budget.date))}
                        </Text>
                    )}
                </Box>

                <Flex align="center" gap={3}>
                    {mode === "edit" && (
                        <IconButton size="md" padding={4} variant="outline" onClick={() => navigate("/ventas/presupuestos")}>
                            <ArrowLeft /> Volver al listado
                        </IconButton>
                    )}

                    {mode === "create" && (
                        <>
                            <SelectWrapper
                                placeholder="Sucursal"
                                onValueChange={(value) => setBranchId(Number(value))}
                                options={branches?.branches.map((b) => ({ label: b.name, value: b.id.toString() })) || []}
                            />
                        </>
                    )}

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
                            options={customers ? customers.map(c => ({ label: c.name, value: c.id.toString() })) : []}
                            disabled={loadingCustomers}
                            width="100%"
                            clearable={true}
                            onClear={() => {
                                setBudgetForm(prev => ({ ...prev, customer: { id: 0, name: "", ruc: "" } }));
                                setSelectedClient("");
                            }}
                        />
                    </Box>
                )}

                <Box flex={2} minW="180px">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">Nombre/Razón Social</Text>
                    <Input
                        size="md"
                        value={budgetForm.customer.name}
                        onChange={(e) => updateCustomerName(e.target.value)}
                        readOnly={!isClientEditable || mode === "edit"}
                        bg={!isClientEditable ? "gray.100" : "white"}
                        placeholder="Nombre del cliente"
                        disabled={mode === "edit"}
                    />
                </Box>

                <Box flex={1.2} minW="150px">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">RUC</Text>
                    <Input
                        size="md"
                        placeholder="RUC del cliente"
                        value={budgetForm.customer.ruc}
                        readOnly={!isClientEditable || mode === "edit"}
                        bg={!isClientEditable ? "gray.100" : "white"}
                        disabled={mode === "edit"}
                        onChange={handleRucChange}
                    />
                </Box>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                    {mode === "edit" && (
                        <Input fontWeight="bold" fontSize="md" color="gray.600" whiteSpace="nowrap" disabled
                            value={`Sucursal: ${branches?.branches.find(b => b.id === budget?.branchId)?.name || " "}`} />
                    )}
                </Box>
                <Box minW="130px">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">Método de Pago</Text>
                    <SelectWrapper
                        value={paymentMethods[budgetForm.pay.method]}
                        onValueChange={updatePaymentMethod}
                        options={paymentOptions}
                        width="100%"
                        disabled={mode === "edit"}
                    />
                </Box>

                <Box minW="150px">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">Condición de Venta</Text>
                    <RadioGroupWrapper
                        value={saleConditions[budgetForm.pay.condition]}
                        onValueChange={updateSaleCondition}
                        options={saleConditionOptions}
                        disabled={mode === "edit"}
                    />
                </Box>
            </Flex>

            <Box flex="1" minHeight="0">
                <ProductsTable
                    products={budgetForm.products.map(p => ({
                        id: p.productId,
                        barcode: p.barcode,
                        name: p.productName,
                        description: p.description,
                        price: p.price,
                        quantity: p.quantity,
                        total: p.price * p.quantity,
                        taxRate: 10,
                        stock: 0,
                    }))}
                    labels={productsLabel}
                    readOnly={mode === "edit"}
                    branchId={branchId}
                    onDataChange={(newData: ProductSaleDTO[]) => {
                        setBudgetForm({
                            ...budgetForm,
                            products: newData.map(p => ({
                                productId: p.id,
                                barcode: p.barcode,
                                productName: p.name || "-",
                                description: p.description,
                                quantity: p.quantity,
                                price: p.price,
                            })),
                        });
                    }}
                />
            </Box>

            <Flex flexShrink={0} mt={2} justify="space-between" align="center" border="2px solid" borderColor="gray.200" p={3} px={6} borderRadius="md">
                <Flex gap={8} align="center">
                    <Text fontSize="3xl" fontWeight="bold">
                        Total:&nbsp;
                        <Text as="span" color="green.600">{parsePrice(budgetForm.totals.total)}</Text>
                    </Text>
                </Flex>

                {mode === "create" && (
                    <Flex gap={3}>
                        <DestructiveActionDialog
                            title="Cancelar Presupuesto"
                            description="¿Estás seguro de que deseas cancelar este presupuesto? Se perderán todos los datos ingresados."
                            onAccept={() => {
                                setSelectedClient("");
                                setBudgetForm(getBudgetTemplate());
                            }}
                            trigger={
                                <Button variant="surface" size="lg">
                                    Cancelar
                                </Button>
                            }
                        />

                        <ConfirmActionDialog
                            title="Confirmar Presupuesto"
                            description="¿Estás seguro de que deseas generar este presupuesto?"
                            onAccept={() => {
                                createBudget.mutate(budgetForm);
                            }}
                            trigger={
                                <IconButton
                                    bg="brand.primary"
                                    padding={4}
                                    size="lg"
                                    color="white"
                                    ref={triggerRef}
                                    disabled={budgetForm.products.length === 0 || createBudget.isPending}
                                >
                                    {createBudget.isPending ? <Spinner /> : <CalendarPlus />} Generar Presupuesto
                                </IconButton>
                            }
                        />
                    </Flex>
                )}
            </Flex>
        </Box>
    );
}