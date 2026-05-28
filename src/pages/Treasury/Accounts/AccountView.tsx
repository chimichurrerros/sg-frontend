import { accountTypeMap, type CreateAccountRequestDto } from "@/api/accounts.api";
import { useGetAccountById, useUpdateAccount, useDeleteAccount } from "@/queries/accounts.queries";
import { useGetBanks } from "@/queries/banks.queries";
import { createAccountSchema, type CreateAccountFormData } from "@/schemas/accounts.schema";
import { toaster } from "@/components/ui/toaster";
import {
    Box,
    Button,
    createListCollection,
    Field,
    Grid,
    IconButton,
    Input,
    Portal,
    Select,
    Separator,
    Stack,
    Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

const accountTypeCollection = createListCollection({
    items: Object.entries(accountTypeMap).map(([value, label]) => ({
        label,
        value,
    })),
});

function LabelValue({ label, value }: { label: string; value: string }) {
    return (
        <Stack>
            <Text fontSize="sm" fontWeight="medium" color="gray.400">
                {label}
            </Text>
            <Text fontSize="sm" color="gray.800">
                {value}
            </Text>
        </Stack>
    );
}

const formatBalance = (value: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(value);

export default function AccountView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const accountId = Number(id);
    const [isEditing, setIsEditing] = useState(false);

    const { data: account, isPending, isError, error } = useGetAccountById(accountId);
    const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount(accountId);
    const { mutate: deleteAccount } = useDeleteAccount();
    const { data: banks } = useGetBanks();

    const bankCollection = createListCollection({
        items: (banks?.banks ?? []).map((bank) => ({
            label: bank.name ?? `Banco #${bank.id}`,
            value: String(bank.id),
        })),
    });

    const bankName = account?.bankId != null
        ? banks?.banks?.find((b) => b.id === account.bankId)?.name ?? `Banco #${account.bankId}`
        : null;

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateAccountFormData>({
        resolver: zodResolver(createAccountSchema),
    });

    useEffect(() => {
        if (account) {
            reset({
                name: account.name ?? "",
                accountType: account.accountType,
                currentBalance: account.currentBalance,
                availableBalance: account.availableBalance,
                accountNumber: account.accountNumber ?? "",
                bankId: account.bankId ?? undefined,
            });
        }
    }, [account, reset]);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar la cuenta",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    const handleSave = (formData: CreateAccountFormData) => {
        const apiData: CreateAccountRequestDto = {
            name: formData.name || null,
            accountType: formData.accountType,
            currentBalance: formData.currentBalance,
            availableBalance: formData.availableBalance,
            accountNumber: formData.accountNumber || null,
            bankId: formData.bankId ?? null,
        };
        updateAccount(apiData, {
            onSuccess: () => {
                toaster.create({ title: "Cuenta actualizada con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
                setIsEditing(false);
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al actualizar la cuenta",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    const handleDelete = () => {
        if (!account) return;
        deleteAccount(account.id, {
            onSuccess: () => {
                toaster.create({ title: "Cuenta eliminada con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
                navigate("/tesoreria/cuentas");
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al eliminar la cuenta",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    if (isPending) {
        return (
            <Box p={4}>
                <Text>Cargando cuenta...</Text>
            </Box>
        );
    }

    if (isError || !account) {
        return (
            <Box p={4}>
                <Text color="red.500">Error al cargar la cuenta.</Text>
                <Button mt={4} variant="ghost" onClick={() => navigate("/tesoreria/cuentas")}>
                    <ArrowLeft /> Volver al listado
                </Button>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="0" p={4}>
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                    {isEditing ? "Editando: " : ""}{account.name ?? "Cuenta"}
                </Text>

                <Box display="flex" gap={4}>
                    <IconButton padding={2} variant="ghost" color="brand.secondary" onClick={() => navigate("/tesoreria/cuentas")}>
                        <ArrowLeft />
                        Volver al listado
                    </IconButton>

                    {!isEditing && (
                        <>
                            <IconButton padding={2} colorPalette="brand" onClick={() => setIsEditing(true)}>
                                <Pencil />
                                Editar
                            </IconButton>
                            <IconButton padding={2} variant="outline" colorPalette="red" onClick={handleDelete}>
                                <Trash2 />
                                Eliminar
                            </IconButton>
                        </>
                    )}

                    {isEditing && (
                        <>
                            <IconButton padding={2} colorPalette="brand" onClick={handleSubmit(handleSave)} loading={isUpdating}>
                                <Save />
                                Guardar
                            </IconButton>
                            <IconButton padding={2} variant="outline" onClick={() => setIsEditing(false)}>
                                <X />
                                Cancelar
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>

            <Separator my={5} color="gray.900" />

            {!isEditing ? (
                <Box bg="white" h="full" w="100%">
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                        <LabelValue label="ID" value={String(account.id)} />
                        <LabelValue label="Nombre" value={account.name ?? "-"} />
                        <LabelValue label="Tipo de Cuenta" value={accountTypeMap[account.accountType] || "Desconocido"} />
                        <LabelValue label="Nro. Cuenta" value={account.accountNumber ?? "-"} />
                        <LabelValue label="Saldo Actual" value={formatBalance(account.currentBalance)} />
                        <LabelValue label="Saldo Disponible" value={formatBalance(account.availableBalance)} />
                        <LabelValue label="Banco" value={bankName ?? "-"} />
                    </Grid>
                </Box>
            ) : (
                <Box bg="white" h="full" w="100%">
                    <Stack as="form" onSubmit={handleSubmit(handleSave)} gap={4} maxW="600px">
                        <Field.Root invalid={!!errors.name} required>
                            <Field.Label>Nombre</Field.Label>
                            <Input
                                {...register("name")}
                                placeholder="Nombre de la cuenta"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.accountType} required>
                            <Field.Label>Tipo de Cuenta</Field.Label>
                            <Controller
                                name="accountType"
                                control={control}
                                render={({ field }) => (
                                    <Select.Root
                                        collection={accountTypeCollection}
                                        value={[String(field.value)]}
                                        onValueChange={(e) => field.onChange(Number(e.value[0]))}
                                        disabled={isUpdating}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Seleccionar tipo de cuenta" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.ClearTrigger />
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {accountTypeCollection.items.map((item) => (
                                                        <Select.Item item={item} key={item.value}>
                                                            {item.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                )}
                            />
                            <Field.ErrorText>{errors.accountType?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.bankId}>
                            <Field.Label>Banco</Field.Label>
                            <Controller
                                name="bankId"
                                control={control}
                                render={({ field }) => (
                                    <Select.Root
                                        collection={bankCollection}
                                        value={field.value != null ? [String(field.value)] : []}
                                        onValueChange={(e) => field.onChange(Number(e.value[0]))}
                                        disabled={isUpdating}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Seleccionar banco" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.ClearTrigger />
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {bankCollection.items.map((item) => (
                                                        <Select.Item item={item} key={item.value}>
                                                            {item.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                )}
                            />
                            <Field.ErrorText>{errors.bankId?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.accountNumber}>
                            <Field.Label>Número de Cuenta</Field.Label>
                            <Input
                                {...register("accountNumber")}
                                placeholder="000-000000-0"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.accountNumber?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.currentBalance} required>
                            <Field.Label>Saldo Actual</Field.Label>
                            <Input
                                {...register("currentBalance", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min={0}
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.currentBalance?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.availableBalance} required>
                            <Field.Label>Saldo Disponible</Field.Label>
                            <Input
                                {...register("availableBalance", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min={0}
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.availableBalance?.message}</Field.ErrorText>
                        </Field.Root>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
