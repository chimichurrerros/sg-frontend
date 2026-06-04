import { Box, Button, ButtonGroup, Field, Grid, HStack, IconButton, Input, Stack, Steps, Text, Textarea } from "@chakra-ui/react";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { ComboboxWrapper } from "@/components/ui/wrappers/combobox-wrapper";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { useGetAccounts } from "@/queries/accounts.queries";
import { useGetPurchaseOrdersForSupplier } from "@/queries/purchase-orders-for-supplier.queries";
import { useCreatePaymentOrder } from "@/queries/paymentOrders.queries";
import { useGetCreditNotes } from "@/queries/credit-notes.queries";
import { paymentMethodOptions } from "@/api/paymentOrders.api";
import { parsePrice } from "@/constants/price";
import { parseDate } from "@/constants/date";
import { Ban, Check, CheckCircle2, Plus, Trash2 } from "lucide-react";

interface PaymentMethodLine {
    id: string;
    method: string;
    accountId: string;
    amount: string;
    referenceNumber: string;
    creditNoteId: string;
    checkNumber: string;
    checkEmisionDate: string;
    checkAvailabilityDate: string;
    checkIssuingBank: string;
    checkType: string;
    checkReceiver: string;
}

const STEPS = [
    { title: "Proveedor y Facturas", description: "Seleccione qué pagar" },
    { title: "Métodos de Pago", description: "Cómo se realizará el pago" },
    { title: "Confirmación", description: "Revisar y finalizar" },
];

const toDisplayDate = (): string => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const toISODate = (display: string): string => {
    if (!display) return "";
    const parts = display.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return display;
};

let methodIdCounter = 0;

export default function PaymentOrderForm() {
    const navigate = useNavigate();
    const today = toDisplayDate();

    const { data: suppliersData } = useAllSuppliers();
    const { data: accountsData } = useGetAccounts({ pageSize: 100 });
    const { data: creditNotesData } = useGetCreditNotes({ pageSize: 100 });
    const { mutate: createPayment, isPending: isSubmitting } = useCreatePaymentOrder();

    const [currentStep, setCurrentStep] = useState(0);
    const [supplierId, setSupplierId] = useState<string>("");
    const [selectedPofsIds, setSelectedPofsIds] = useState<Set<number>>(new Set());
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodLine[]>([]);
    const [paymentDate, setPaymentDate] = useState(today);
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: pofsData, isPending: loadingPOFS } = useGetPurchaseOrdersForSupplier(
        { supplierId: supplierId ? Number(supplierId) : undefined, state: 2, pageSize: 100 },
        !!supplierId,
    );

    const suppliers = useMemo(() => suppliersData?.suppliers || [], [suppliersData]);
    const accounts = useMemo(() => (accountsData?.accounts || []).filter((a) => a.isActive), [accountsData]);
    const cashAccounts = useMemo(() => accounts.filter((a) => a.accountType === 2), [accounts]);
    const bankAccounts = useMemo(() => accounts.filter((a) => a.accountType !== 2), [accounts]);
    const creditNotes = useMemo(() => creditNotesData?.creditNotes || [], [creditNotesData]);

    const supplierOptions = useMemo(() =>
        suppliers.map((s) => ({
            value: s.id.toString(),
            label: `${s.businessName}${s.fantasyName ? ` (${s.fantasyName})` : ""}`,
        })),
        [suppliers],
    );

    const accountOptions = useMemo(() =>
        accounts.map((a) => ({
            value: a.id.toString(),
            label: `${a.name || "Cuenta"} ${a.accountNumber ? `- ${a.accountNumber}` : ""}`,
        })),
        [accounts],
    );

    const cashAccountOptions = useMemo(() =>
        cashAccounts.map((a) => ({
            value: a.id.toString(),
            label: `${a.name || "Cuenta"} ${a.accountNumber ? `- ${a.accountNumber}` : ""}`,
        })),
        [cashAccounts],
    );

    const bankAccountOptions = useMemo(() =>
        bankAccounts.map((a) => ({
            value: a.id.toString(),
            label: `${a.name || "Cuenta"} ${a.accountNumber ? `- ${a.accountNumber}` : ""}`,
        })),
        [bankAccounts],
    );

    const creditNoteOptions = useMemo(() =>
        creditNotes.map((cn) => ({
            value: cn.id.toString(),
            label: `NC #${cn.id} - ${cn.billNumber || ""} (${parsePrice(cn.total)})`,
        })),
        [creditNotes],
    );

    const methodOptions = useMemo(() =>
        paymentMethodOptions.map((m) => ({ value: m.value, label: m.label })),
        [],
    );

    const pofsList = useMemo(() => {
        const list = pofsData?.purchaseOrdersForSupplier || [];
        return list.filter((p) => p.state === 2 || p.state === 3 || p.state === 4);
    }, [pofsData]);

    const selectedBills = useMemo(
        () => pofsList.filter((p) => selectedPofsIds.has(p.id)),
        [pofsList, selectedPofsIds],
    );

    const totalSelected = useMemo(
        () => selectedBills.reduce((sum, p) => sum + p.total, 0),
        [selectedBills],
    );

    const methodsTotal = useMemo(
        () => paymentMethods.reduce((sum, m) => sum + (Number(m.amount) || 0), 0),
        [paymentMethods],
    );

    const methodsMatch = methodsTotal === totalSelected && totalSelected > 0;

    const togglePofs = (id: number) => {
        setSelectedPofsIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setErrors({});
    };

    const selectAll = () => {
        const allSelected = pofsList.every((p) => selectedPofsIds.has(p.id));
        if (allSelected) {
            setSelectedPofsIds(new Set());
        } else {
            setSelectedPofsIds(new Set(pofsList.map((p) => p.id)));
        }
        setErrors({});
    };

    const addPaymentMethod = () => {
        methodIdCounter += 1;
        setPaymentMethods((prev) => [
            ...prev,
            {
                id: `m-${methodIdCounter}`,
                method: "Transfer",
                accountId: "",
                amount: "",
                referenceNumber: "",
                creditNoteId: "",
                checkNumber: "",
                checkEmisionDate: "",
                checkAvailabilityDate: "",
                checkIssuingBank: "",
                checkType: "0",
                checkReceiver: "",
            },
        ]);
        setErrors({});
    };

    const removePaymentMethod = (id: string) => {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        setErrors({});
    };

    const updatePaymentMethod = (id: string, patch: Partial<PaymentMethodLine>) => {
        setPaymentMethods((prev) =>
            prev.map((m) => {
                if (m.id !== id) return m;
                const updated = { ...m, ...patch };
                if (patch.method !== undefined) {
                    updated.accountId = "";
                    updated.creditNoteId = "";
                    updated.checkNumber = "";
                    updated.checkEmisionDate = "";
                    updated.checkAvailabilityDate = "";
                    updated.checkIssuingBank = "";
                    updated.checkType = "0";
                    updated.checkReceiver = "";
                }
                return updated;
            }),
        );
        setErrors({});
    };

    const validateStep0 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!supplierId) errs.supplier = "Seleccione un proveedor";
        if (selectedBills.length === 0) errs.bills = "Seleccione al menos una OC para pagar";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep1 = (): boolean => {
        const errs: Record<string, string> = {};
        if (paymentMethods.length === 0) {
            errs.methods = "Agregue al menos un método de pago";
        }
        for (const m of paymentMethods) {
            const isCredit = m.method === "CreditNote";
            const isCheck = m.method === "Check";
            if (!isCredit && !isCheck && !m.accountId) errs[`acc-${m.id}`] = "Seleccione cuenta";
            if (isCredit && !m.creditNoteId) errs[`acc-${m.id}`] = "Seleccione nota de crédito";
            if (isCheck) {
                if (!m.accountId) errs[`acc-${m.id}`] = "Seleccione cuenta";
                if (!m.checkNumber?.trim()) errs[`chk-${m.id}`] = "N° de cheque requerido";
                if (!m.checkIssuingBank?.trim()) errs[`chkb-${m.id}`] = "Banco emisor requerido";
            }
            if (!m.amount || Number(m.amount) <= 0) errs[`amt-${m.id}`] = "Monto inválido";
        }
        if (paymentMethods.length > 0 && Math.abs(methodsTotal - totalSelected) > 0.01) {
            errs.balance = `Total de métodos (${parsePrice(methodsTotal)}) ≠ Total seleccionado (${parsePrice(totalSelected)})`;
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const goNext = () => {
        if (currentStep === 0 && !validateStep0()) return;
        if (currentStep === 1 && !validateStep1()) return;
        setCurrentStep((s) => Math.min(s + 1, 2));
    };

    const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const onFormSubmit = () => {
        const methods = paymentMethods.map((m) => {
            const isCredit = m.method === "CreditNote";
            const isCheck = m.method === "Check";
            return {
                method: m.method,
                accountId: isCredit ? 0 : Number(m.accountId),
                amount: Number(m.amount),
                referenceNumber: m.referenceNumber?.trim() || undefined,
                creditNoteId: isCredit ? Number(m.creditNoteId) : undefined,
                checkDetails: isCheck
                    ? {
                          accountId: Number(m.accountId),
                          number: m.checkNumber.trim(),
                          emisionDate: m.checkEmisionDate ? new Date(m.checkEmisionDate).toISOString() : new Date().toISOString(),
                          availabilityDate: m.checkAvailabilityDate || undefined,
                          issuingBank: m.checkIssuingBank.trim(),
                          type: Number(m.checkType),
                          receiver: m.checkReceiver?.trim() || "",
                      }
                    : undefined,
            };
        });

        const promises = selectedBills.map(
            (pofs) =>
                new Promise<void>((resolve, reject) => {
                    createPayment(
                        {
                            purchaseOrderForSupplierId: pofs.id,
                            paymentDate: toISODate(paymentDate),
                            notes: notes.trim() || undefined,
                            methods,
                        },
                        { onSuccess: () => resolve(), onError: (e: Error) => reject(e) },
                    );
                }),
        );

        Promise.all(promises)
            .then(() => {
                toaster.create({ title: "Órdenes de pago registradas exitosamente", type: "success" });
                navigate("/tesoreria/ordenes-pago");
            })
            .catch(() => {});
    };

    const renderStep0 = () => (
        <Stack gap={4}>
            <Field.Root invalid={!!errors.supplier}>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Proveedor *</Text>
                <ComboboxWrapper
                    options={supplierOptions}
                    width="50%"
                    placeholder="Buscar proveedor..."
                    value={supplierId}
                    onValueChange={(v) => {
                        setSupplierId(v);
                        setSelectedPofsIds(new Set());
                        setErrors({});
                    }}
                    clearable
                />
                <Field.ErrorText>{errors.supplier}</Field.ErrorText>
            </Field.Root>

            {loadingPOFS && <Text fontSize="sm" color="gray.500">Cargando OC pendientes...</Text>}

            {!loadingPOFS && supplierId && pofsList.length === 0 && (
                <Text color="gray.500" fontSize="sm">No se encontraron OC pendientes para este proveedor.</Text>
            )}

            {pofsList.length > 0 && (
                <>
                    <Text fontSize="md" fontWeight="bold" color="gray.600">Seleccione OC a pagar</Text>
                    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                        <Box display="flex" bg="gray.50" px={4} py={2} fontWeight="bold" fontSize="sm">
                            <Box w="40px" />
                            <Box flex="1">OC N°</Box>
                            <Box w="120px">Fecha</Box>
                            <Box w="140px" textAlign="right">Total</Box>
                        </Box>
                        {pofsList.map((pofs) => {
                            const sel = selectedPofsIds.has(pofs.id);
                            return (
                                <HStack
                                    key={pofs.id}
                                    px={4}
                                    py={2}
                                    borderTopWidth="1px"
                                    borderColor="gray.100"
                                    cursor="pointer"
                                    bg={sel ? "blue.50" : "transparent"}
                                    _hover={{ bg: "gray.50" }}
                                    onClick={() => togglePofs(pofs.id)}
                                >
                                    <Box
                                        w="22px" h="22px"
                                        display="flex" alignItems="center" justifyContent="center"
                                        bg={sel ? "brand.primary" : "gray.200"}
                                        color={sel ? "white" : "transparent"}
                                        borderRadius="sm" fontSize="xs" fontWeight="bold" mr={2}
                                    >
                                        {sel && <Check size={14} />}
                                    </Box>
                                    <Box flex="1" fontWeight="medium">{pofs.number}</Box>
                                    <Box w="120px" fontSize="sm" color="gray.600">{parseDate(pofs.date)}</Box>
                                    <Box w="140px" textAlign="right" fontWeight="medium">{parsePrice(pofs.total)}</Box>
                                </HStack>
                            );
                        })}
                    </Box>
                    <HStack justifyContent="space-between" mt={2}>
                        <Button size="xs" variant="outline" onClick={selectAll}>
                            {pofsList.every((p) => selectedPofsIds.has(p.id)) ? "Deseleccionar todo" : "Seleccionar todo"}
                        </Button>
                        <Text fontWeight="bold">
                            Total: <Text as="span" color="brand.primary">{parsePrice(totalSelected)}</Text>
                        </Text>
                    </HStack>
                </>
            )}
            {errors.bills && <Text color="red.500" fontSize="sm">{errors.bills}</Text>}
        </Stack>
    );

    const renderStep1 = () => (
        <Stack gap={4}>
            <HStack justifyContent="space-between">
                <Text fontSize="md" fontWeight="bold" color="gray.600">Métodos de Pago</Text>
                <Button size="sm" variant="outline" onClick={addPaymentMethod}>
                    <Plus size={16} /> Agregar método
                </Button>
            </HStack>

            {paymentMethods.length === 0 && (
                <Box p={6} border="1px dashed" borderColor="gray.300" borderRadius="md" textAlign="center">
                    <Text color="gray.500">No hay métodos de pago. Haga clic en "Agregar método" para comenzar.</Text>
                </Box>
            )}

            {paymentMethods.length > 0 && (
                <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                    <Box display="flex" bg="gray.50" px={4} py={2} fontWeight="bold" fontSize="sm" gap={2}>
                        <Box w="160px">Método</Box>
                        <Box flex="1">Cuenta / Referencia</Box>
                        <Box w="140px">Monto</Box>
                        <Box w="48px" />
                    </Box>
                    {paymentMethods.map((m) => {
                        const isCredit = m.method === "CreditNote";
                        const isCash = m.method === "Cash";
                        const isCheck = m.method === "Check";
                        const accOpts = isCash ? cashAccountOptions : bankAccountOptions;
                        return (
                            <Box key={m.id} px={4} py={3} borderTopWidth="1px" borderColor="gray.100">
                                <HStack gap={2} align="flex-start">
                                    <SelectWrapper
                                        options={methodOptions}
                                        width="160px"
                                        value={m.method}
                                        onValueChange={(v) => updatePaymentMethod(m.id, { method: v })}
                                    />
                                    <Stack gap={1} flex="1">
                                        {isCredit ? (
                                            <ComboboxWrapper
                                                options={creditNoteOptions}
                                                width="100%"
                                                placeholder="Seleccionar nota de crédito *"
                                                value={m.creditNoteId}
                                                onValueChange={(v) => updatePaymentMethod(m.id, { creditNoteId: v })}
                                                clearable
                                            />
                                        ) : (
                                            <SelectWrapper
                                                width="100%"
                                                placeholder={isCash ? "Cuenta efectivo *" : "Cuenta bancaria *"}
                                                value={m.accountId}
                                                onValueChange={(v) => updatePaymentMethod(m.id, { accountId: v })}
                                                options={accOpts}
                                            />
                                        )}
                                        <Input
                                            size="sm"
                                            value={m.referenceNumber}
                                            onChange={(e) => updatePaymentMethod(m.id, { referenceNumber: e.target.value })}
                                            placeholder="N° Referencia"
                                        />
                                        {errors[`acc-${m.id}`] && <Text color="red.500" fontSize="xs">{errors[`acc-${m.id}`]}</Text>}
                                        {isCheck && (
                                            <>
                                                <Text fontSize="xs" fontWeight="medium" mt={1} color="gray.500">Detalles del Cheque</Text>
                                                <Input
                                                    size="sm"
                                                    value={m.checkNumber}
                                                    onChange={(e) => updatePaymentMethod(m.id, { checkNumber: e.target.value })}
                                                    placeholder="N° Cheque *"
                                                />
                                                {errors[`chk-${m.id}`] && <Text color="red.500" fontSize="xs">{errors[`chk-${m.id}`]}</Text>}
                                                <Input
                                                    size="sm"
                                                    type="date"
                                                    value={m.checkEmisionDate}
                                                    onChange={(e) => updatePaymentMethod(m.id, { checkEmisionDate: e.target.value })}
                                                    placeholder="Fecha emisión"
                                                />
                                                <Input
                                                    size="sm"
                                                    type="date"
                                                    value={m.checkAvailabilityDate}
                                                    onChange={(e) => updatePaymentMethod(m.id, { checkAvailabilityDate: e.target.value })}
                                                    placeholder="Fecha disponibilidad"
                                                />
                                                <Input
                                                    size="sm"
                                                    value={m.checkIssuingBank}
                                                    onChange={(e) => updatePaymentMethod(m.id, { checkIssuingBank: e.target.value })}
                                                    placeholder="Banco emisor *"
                                                />
                                                {errors[`chkb-${m.id}`] && <Text color="red.500" fontSize="xs">{errors[`chkb-${m.id}`]}</Text>}
                                                <SelectWrapper
                                                    options={[
                                                        { value: "0", label: "Común" },
                                                        { value: "1", label: "Diferido" },
                                                    ]}
                                                    width="100%"
                                                    value={m.checkType}
                                                    onValueChange={(v) => updatePaymentMethod(m.id, { checkType: v })}
                                                />
                                                <Input
                                                    size="sm"
                                                    value={m.checkReceiver}
                                                    onChange={(e) => updatePaymentMethod(m.id, { checkReceiver: e.target.value })}
                                                    placeholder="Receptor"
                                                />
                                            </>
                                        )}
                                    </Stack>
                                    <Input
                                        size="sm"
                                        w="140px"
                                        type="number"
                                        min="0"
                                        value={m.amount}
                                        onChange={(e) => updatePaymentMethod(m.id, { amount: e.target.value })}
                                        placeholder="0"
                                    />
                                    <IconButton
                                        size="xs"
                                        variant="ghost"
                                        aria-label="Eliminar método"
                                        onClick={() => removePaymentMethod(m.id)}
                                        color="red.500"
                                    >
                                        <Trash2 size={14} />
                                    </IconButton>
                                </HStack>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {paymentMethods.length > 0 && (
                <HStack justifyContent="space-between" p={3} bg="bg.subtle" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                        Total seleccionado: {parsePrice(totalSelected)} | Suma: {parsePrice(methodsTotal)}
                    </Text>
                    <HStack gap={1}>
                        {methodsMatch ? (
                            <>
                                <Check size={16} color="green" />
                                <Text fontWeight="bold" color="green.600">Balance correcto</Text>
                            </>
                        ) : (
                            <>
                                <Ban size={16} color="red" />
                                <Text fontWeight="bold" color="red.600">
                                    Diferencia: {parsePrice(Math.abs(methodsTotal - totalSelected))}
                                </Text>
                            </>
                        )}
                    </HStack>
                </HStack>
            )}
            {errors.methods && <Text color="red.500" fontSize="sm">{errors.methods}</Text>}
            {errors.balance && <Text color="red.500" fontSize="sm">{errors.balance}</Text>}
        </Stack>
    );

    const renderStep2 = () => (
        <Stack gap={6}>
            <Box p={4} bg="bg.subtle" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">OC Seleccionadas ({selectedBills.length})</Text>
                {selectedBills.map((pofs) => (
                    <HStack key={pofs.id} justifyContent="space-between" py={1}>
                        <Text>OC #{pofs.number} — {pofs.supplierName}</Text>
                        <Text fontWeight="medium">{parsePrice(pofs.total)}</Text>
                    </HStack>
                ))}
                <HStack justifyContent="space-between" mt={3} pt={3} borderTopWidth="1px" borderColor="gray.200">
                    <Text fontWeight="bold">Total a pagar</Text>
                    <Text fontWeight="bold" color="brand.primary" fontSize="lg">{parsePrice(totalSelected)}</Text>
                </HStack>
            </Box>

            <Box p={4} bg="bg.subtle" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">Métodos de Pago</Text>
                {paymentMethods.map((m) => (
                    <Stack key={m.id} py={1} gap={0}>
                        <HStack justifyContent="space-between">
                            <Text>{m.method}{m.referenceNumber ? ` (Ref: ${m.referenceNumber})` : ""}</Text>
                            <Text fontWeight="medium">{parsePrice(Number(m.amount) || 0)}</Text>
                        </HStack>
                        {m.method === "Check" && m.checkNumber && (
                            <Text fontSize="xs" color="gray.500">Cheque #{m.checkNumber} — {m.checkIssuingBank}</Text>
                        )}
                        {m.method === "CreditNote" && m.creditNoteId && (
                            <Text fontSize="xs" color="gray.500">NC ID: {m.creditNoteId}</Text>
                        )}
                    </Stack>
                ))}
                <HStack justifyContent="space-between" mt={3} pt={3} borderTopWidth="1px" borderColor="gray.200">
                    <Text fontWeight="bold">Suma</Text>
                    <Text fontWeight="bold" color={methodsMatch ? "green.600" : "red.600"}>{parsePrice(methodsTotal)}</Text>
                </HStack>
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <Field.Root>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Fecha de Pago *</Text>
                    <Input size="sm" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="dd/mm/aaaa" />
                </Field.Root>
                <Box />
            </Grid>

            <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Notas</Text>
                <Textarea size="sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" rows={3} />
            </Box>
        </Stack>
    );

    return (
        <Box display="flex" flexDirection="column" gap={6} height="full" minHeight="0">
            <Text fontSize="2xl" fontWeight="bold">Nueva Orden de Pago</Text>

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

                <Box minHeight="50vh" py={6}>
                    <Steps.Content index={0}>{renderStep0()}</Steps.Content>
                    <Steps.Content index={1}>{renderStep1()}</Steps.Content>
                    <Steps.Content index={2}>{renderStep2()}</Steps.Content>
                    <Steps.CompletedContent>
                        <Box textAlign="center" py={10}>
                            <CheckCircle2 size={48} color="green" />
                            <Text fontSize="xl" fontWeight="bold" mt={4}>Orden de Pago completada</Text>
                        </Box>
                    </Steps.CompletedContent>
                </Box>
            </Steps.Root>

            <ButtonGroup size="lg" justifyContent="space-between" display="flex">
                <Button variant="outline" onClick={() => navigate("/tesoreria/ordenes-pago")}>Cancelar</Button>
                <Box display="flex" gap={3}>
                    <Button variant="outline" onClick={goBack} disabled={currentStep === 0}>Anterior</Button>
                    {currentStep < 2 ? (
                        <Button bgColor="brand.primary" onClick={goNext}>Siguiente</Button>
                    ) : (
                        <Button bgColor="brand.primary" onClick={onFormSubmit} loading={isSubmitting}>Procesar Pago</Button>
                    )}
                </Box>
            </ButtonGroup>
        </Box>
    );
}
