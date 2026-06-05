import { Box, Button, ButtonGroup, Field, Grid, Input, Spinner, Stack, Steps, Text, Textarea } from "@chakra-ui/react";
import TableEditable, { type EditableLabel } from "@/components/ui/tables/table-edit";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { ComboboxWrapper } from "@/components/ui/wrappers/combobox-wrapper";
import PageTitle from "@/components/ui/title";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { Package, CheckCircle2 } from "lucide-react";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { useAllBranches } from "@/queries/branches.queries";
import { useGetAllPurchaseOrdersForSupplier } from "@/queries/purchase-orders-for-supplier.queries";
import { useCreatePurchaseReceipt } from "@/queries/purchase-receipts.queries";
import type { PurchaseOrderForSupplier } from "@/api/purchaseOrderForSupplier.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
    purchaseReceiptStep0Schema,
    purchaseReceiptDetailsSchema,
} from "@/schemas/purchaseReceipts.schema";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";

const STEPS = [
    { title: "Datos Generales", description: "OC por proveedor y factura" },
    { title: "Productos", description: "Cantidades y precios" },
    { title: "Confirmación", description: "Revisar y finalizar" },
];

interface DetailItem {
    id: number;
    productId: number;
    productName: string;
    quantityOrdered: number;
    quantity: number;
    price: number;
}

export default function PurchaseReceiptWizard() {
    const navigate = useNavigate();

    const { data: pofsData, isPending: loadingPOFS } = useGetAllPurchaseOrdersForSupplier();
    const { data: suppliersData, isPending: loadingSuppliers } = useAllSuppliers();
    const { data: branchesData, isPending: loadingBranches } = useAllBranches();
    const { mutate: createReceipt, isPending: isSubmitting } = useCreatePurchaseReceipt();

    const {
        control,
        register,
        trigger,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(purchaseReceiptStep0Schema),
        defaultValues: {
            pofsId: "",
            supplierId: "",
            branchId: "",
            billNumber: "",
            stamp: "",
            date: new Date().toISOString().split("T")[0],
            observation: "",
        },
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPOFS, setSelectedPOFS] = useState<PurchaseOrderForSupplier | null>(null);
    const [details, setDetails] = useState<DetailItem[]>([]);
    const [detailErrors, setDetailErrors] = useState<string[]>([]);

    const watchedPofsId = watch("pofsId");
    const watchedSupplierId = watch("supplierId");
    const watchedBranchId = watch("branchId");
    const watchedBillNumber = watch("billNumber");
    const watchedDate = watch("date");

    const pofsList = useMemo(() =>
        (pofsData?.purchaseOrdersForSupplier || [])
            .filter((p) => p.state === 1),
        [pofsData],
    );
    const suppliers = useMemo(() => suppliersData?.suppliers || [], [suppliersData]);
    const branches = useMemo(() => branchesData?.branches || [], [branchesData]);

    const pofsOptions = useMemo(() =>
        pofsList.map((pofs) => ({
            value: pofs.id.toString(),
            label: `#${pofs.number} - ${pofs.supplierName} - ${pofs.date?.slice(0, 10)}`,
        })),
        [pofsList],
    );

    const supplierOptions = useMemo(() =>
        suppliers.map((s) => ({
            value: s.id.toString(),
            label: `${s.businessName}${s.fantasyName ? ` (${s.fantasyName})` : ""}`,
        })),
        [suppliers],
    );

    const branchOptions = useMemo(() =>
        branches.map((b) => ({
            value: b.id.toString(),
            label: b.name,
        })),
        [branches],
    );

    useEffect(() => {
        if (watchedPofsId) {
            const pofs = pofsList.find((p) => p.id.toString() === watchedPofsId) || null;
            setSelectedPOFS(pofs);
            if (pofs) {
                setValue("supplierId", pofs.supplierId.toString());
            }
        } else {
            setSelectedPOFS(null);
        }
    }, [watchedPofsId, pofsList, setValue]);

    const loadProducts = () => {
        if (!selectedPOFS) return;
        const items: DetailItem[] = selectedPOFS.details.map((d, i) => ({
            id: i + 1,
            productId: d.productId,
            productName: d.productName,
            quantityOrdered: d.quantityOrdered,
            quantity: d.quantityOrdered,
            price: d.price,
        }));
        setDetails(items);
        setDetailErrors([]);
    };

    const validateDetails = (): boolean => {
        if (details.length === 0) {
            setDetailErrors(["Debe haber al menos un producto para recibir"]);
            return false;
        }
        const result = purchaseReceiptDetailsSchema.safeParse(
            details.map((d) => ({ productId: d.productId, quantity: d.quantity, price: d.price })),
        );
        if (!result.success) {
            const errs = result.error.issues
                .filter((issue) => issue.path.length >= 1)
                .map((issue) => {
                    const idx = typeof issue.path[0] === "number" ? issue.path[0] : 0;
                    const product = details[idx]?.productName || `Ítem ${idx + 1}`;
                    return `${product}: ${issue.message}`;
                });
            if (errs.length === 0) {
                errs.push("Datos inválidos en los productos");
            }
            setDetailErrors(errs);
            return false;
        }
        setDetailErrors([]);
        return true;
    };

    const goNext = async () => {
        if (currentStep === 0) {
            const valid = await trigger(["pofsId", "supplierId", "branchId", "billNumber", "stamp", "date"]);
            if (!valid) return;
            loadProducts();
        }
        if (currentStep === 1) {
            if (!validateDetails()) return;
        }
        setCurrentStep((s) => Math.min(s + 1, 2));
    };

    const goBack = () => {
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    const onFormSubmit = async () => {
        const valid = await trigger();
        if (!valid || !selectedPOFS || !validateDetails()) return;
        const data = getValues();
        createReceipt(
            {
                purchaseOrderForSupplierId: Number(data.pofsId),
                billNumber: data.billNumber.trim(),
                stamp: data.stamp?.trim() || "",
                date: data.date,
                supplierId: Number(data.supplierId),
                branchId: Number(data.branchId),
                observation: data.observation?.trim() || "",
                details: details.map((d) => ({
                    productId: d.productId,
                    quantity: d.quantity,
                    price: d.price,
                })),
            },
            {
                onSuccess: () => {
                    toaster.create({
                        title: "Recepción registrada exitosamente",
                        type: "success",
                    });
                    navigate("/compras/recepcion-ordenes-compra");
                },
                onError: (error: Error) => {
                    const axiosError = error as { response?: { data?: { title?: string } } };
                    const msg = axiosError.response?.data?.title || error.message;
                    toaster.create({
                        title: "Error al registrar recepción: " + msg,
                        type: "error",
                    });
                },
            },
        );
    };

    const productLabels: EditableLabel<DetailItem>[] = [
        { labelName: "Producto", propName: "productName" },
        { labelName: "Cant. Ordenada", propName: "quantityOrdered" },
        {
            labelName: "Cant. Recibida", propName: "quantity", isEditable: true, inputType: "number",
            validate: (v) => {
                const n = Number(v);
                return !isNaN(n) && n >= 0;
            },
            transform: (v) => Number(v),
        },
        {
            labelName: "Precio Unit.", propName: "price", isEditable: true, inputType: "number",
            validate: (v) => {
                const n = Number(v);
                return !isNaN(n) && n >= 0;
            },
            transform: (v) => Number(v),
        },
    ];

    const renderStep0 = () => (
        <Stack gap={4}>
            {/* OC - full width, own row */}
            <Field.Root invalid={!!errors.pofsId} width="50%">
                <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Orden de Compra por Proveedor *
                </Text>
                <Box position="relative" width="100%">
                    <Controller
                        name="pofsId"
                        control={control}
                        render={({ field }) => (
                            <ComboboxWrapper
                                options={pofsOptions}
                                width="100%"
                                placeholder="Buscar orden de compra..."
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={loadingPOFS}
                                clearable
                            />
                        )}
                    />
                    {loadingPOFS && (
                        <Box position="absolute" top="50%" transform="translateY(-50%)" right={3} zIndex={1}>
                            <Spinner size="sm" />
                        </Box>
                    )}
                </Box>
                <Field.ErrorText>{errors.pofsId?.message}</Field.ErrorText>
            </Field.Root>

            {/* Supplier + Branch - 2 cols */}
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <Field.Root invalid={!!errors.supplierId}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Proveedor *
                    </Text>
                    <Controller
                        name="supplierId"
                        control={control}
                        render={({ field }) => (
                            <SelectWrapper
                                options={supplierOptions}
                                width="100%"
                                placeholder="Seleccione un proveedor"
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!!watchedPofsId || loadingSuppliers}
                            />
                        )}
                    />
                    <Field.ErrorText>{errors.supplierId?.message}</Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={!!errors.branchId}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Sucursal *
                    </Text>
                    <Controller
                        name="branchId"
                        control={control}
                        render={({ field }) => (
                            <SelectWrapper
                                options={branchOptions}
                                width="100%"
                                placeholder="Seleccione una sucursal"
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={loadingBranches}
                            />
                        )}
                    />
                    <Field.ErrorText>{errors.branchId?.message}</Field.ErrorText>
                </Field.Root>
            </Grid>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <Field.Root invalid={!!errors.billNumber}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Nro. Factura *
                    </Text>
                    <Input
                        size="sm"
                        {...register("billNumber")}
                        placeholder="001-001-0000000"
                    />
                    <Field.ErrorText>{errors.billNumber?.message}</Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={!!errors.stamp}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Timbrado
                    </Text>
                    <Input
                        size="sm"
                        {...register("stamp")}
                        placeholder="12345678"
                    />
                    <Field.ErrorText>{errors.stamp?.message}</Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={!!errors.date}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Fecha *
                    </Text>
                    <DatePickerWrapper
                        size="sm"
                        value={watchedDate}
                        onChange={(e) => setValue("date", e[0] || "")}
                    />
                    <Field.ErrorText>{errors.date?.message}</Field.ErrorText>
                </Field.Root>
            </Grid>
            <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Observación
                </Text>
                <Textarea
                    size="sm"
                    {...register("observation")}
                    placeholder="Observaciones (opcional)"
                    rows={3}
                />
            </Box>
        </Stack>
    );

    const renderStep1 = () => (
        <Box>
            {selectedPOFS ? (
                <Box>
                    {detailErrors.length > 0 && (
                        <Box mb={3} p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
                            {detailErrors.map((err, i) => (
                                <Text key={i} color="red.600" fontSize="sm">{err}</Text>
                            ))}
                        </Box>
                    )}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="40vh">
                        <TableEditable
                            labels={productLabels}
                            data={details}
                            height="100%"
                            noItemsComponent={
                                <EmptyDataScreen
                                    title="Sin productos"
                                    message="Esta orden de compra no tiene productos."
                                    icon={<Package size={48} color="gray" />}
                                />
                            }
                            onDataChange={(newData) => {
                                setDetails(newData);
                                setDetailErrors([]);
                            }}
                        />
                    </Box>
                </Box>
            ) : (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="30vh"
                    border="1px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                >
                    <Text color="gray.500">Seleccione una orden de compra en el paso anterior</Text>
                </Box>
            )}
        </Box>
    );

    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0);
    const totalAmount = details.reduce((sum, d) => sum + d.quantity * d.price, 0);

    const renderStep2 = () => {
        const pofs = selectedPOFS;
        const supplier = suppliers.find((s) => s.id.toString() === watchedSupplierId);
        const branch = branches.find((b) => b.id.toString() === watchedBranchId);
        return (
            <Stack gap={6}>
                <Box p={4} bg="bg.subtle" borderRadius="md">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                            <Text fontSize="sm" color="gray.500">OC por Proveedor</Text>
                            <Text fontWeight="medium">#{pofs?.id} - {pofs?.supplierName}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Proveedor</Text>
                            <Text fontWeight="medium">{supplier?.businessName || "-"}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Sucursal</Text>
                            <Text fontWeight="medium">{branch?.name || "-"}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Factura</Text>
                            <Text fontWeight="medium">{watchedBillNumber || "-"}</Text>
                        </Box>
                    </Grid>
                </Box>
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Productos a recibir ({details.length} ítems)
                    </Text>
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="25vh">
                        <TableEditable
                            labels={productLabels}
                            data={details}
                            height="100%"
                            noItemsComponent={
                                <EmptyDataScreen
                                    title="Sin productos"
                                    message="No hay productos para recibir."
                                    icon={<Package size={48} color="gray" />}
                                />
                            }
                            onDataChange={(newData) => setDetails(newData)}
                        />
                    </Box>
                </Box>
                <Box p={4} bg="bg.subtle" borderRadius="md">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Total Unidades</Text>
                            <Text fontWeight="bold" fontSize="lg">{totalQuantity}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Total</Text>
                            <Text fontWeight="bold" fontSize="lg">
                                {totalAmount.toLocaleString("es-PY", { style: "currency", currency: "PYG" })}
                            </Text>
                        </Box>
                    </Grid>
                </Box>
            </Stack>
        );
    };

    return (
        <Box display="flex" flexDirection="column" gap={6} height="full" minHeight="0">
            <PageTitle>
                Recepción de Órdenes de Compra
            </PageTitle>

            <Steps.Root count={3} step={currentStep} onStepChange={(e: { step: number }) => setCurrentStep(e.step)}>
                <Steps.List>
                    {STEPS.map((step, index) => (
                        <Steps.Item key={index} index={index}>
                            <Steps.Indicator />
                            <Steps.Title>{step.title}</Steps.Title>
                            <Steps.Description hideBelow="md">{step.description}</Steps.Description>
                            <Steps.Separator />
                        </Steps.Item>
                    ))}
                </Steps.List>

                <Box minHeight="55vh" py={6}>
                    <Steps.Content index={0}>{renderStep0()}</Steps.Content>
                    <Steps.Content index={1}>{renderStep1()}</Steps.Content>
                    <Steps.Content index={2}>{renderStep2()}</Steps.Content>
                    <Steps.CompletedContent>
                        <Box textAlign="center" py={10}>
                            <CheckCircle2 size={48} color="green" />
                            <Text fontSize="xl" fontWeight="bold" mt={4}>
                                Recepción completada
                            </Text>
                        </Box>
                    </Steps.CompletedContent>
                </Box>
            </Steps.Root>

            <ButtonGroup size="lg" justifyContent="space-between" display="flex">
                <Button variant="outline" onClick={() => navigate("/compras/recepcion-ordenes-compra")}>
                    Cancelar
                </Button>
                <Box display="flex" gap={3}>
                    <Button variant="outline" onClick={goBack} disabled={currentStep === 0}>
                        Anterior
                    </Button>
                    {currentStep < 2 ? (
                        <Button bgColor="brand.primary" onClick={goNext}>
                            Siguiente
                        </Button>
                    ) : (
                        <Button bgColor="brand.primary" onClick={onFormSubmit} loading={isSubmitting}>
                            Finalizar
                        </Button>
                    )}
                </Box>
            </ButtonGroup>
        </Box>
    );
}
