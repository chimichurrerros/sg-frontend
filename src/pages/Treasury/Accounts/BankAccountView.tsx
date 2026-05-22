import { type AccountResponseDto, accountTypeMap } from "@/api/bankAccounts.api";
import { useGetAccountById, useUpdateAccount, useDeleteAccount } from "@/queries/bankAccounts.queries";
import { createAccountSchema, type CreateAccountFormData } from "@/schemas/bankAccounts.schema";
import { toaster } from "@/components/ui/toaster";
import {
    Box,
    Button,
    createListCollection,
    Field,
    Grid,
    GridItem,
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

export default function BankAccountView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const accountId = Number(id);
    const [isEditing, setIsEditing] = useState(false);

    const { data: account, isPending, isError, error } = useGetAccountById(accountId);
    const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount(accountId);
    const { mutate: deleteAccount } = useDeleteAccount();

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
            });
        }
    }, [account, reset]);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar la cuenta bancaria",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    const handleSave = (formData: CreateAccountFormData) => {
        updateAccount(formData, {
            onSuccess: () => {
                toaster.create({ title: "Cuenta bancaria actualizada con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
                setIsEditing(false);
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al actualizar la cuenta bancaria",
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
                toaster.create({ title: "Cuenta bancaria eliminada con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
                navigate("/tesoreria/cuentas-bancarias");
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al eliminar la cuenta bancaria",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    if (isPending) {
        return (
            <Box p={4}>
                <Text>Cargando cuenta bancaria...</Text>
            </Box>
        );
    }

    if (isError || !account) {
        return (
            <Box p={4}>
                <Text color="red.500">Error al cargar la cuenta bancaria.</Text>
                <Button mt={4} variant="ghost" onClick={() => navigate("/tesoreria/cuentas-bancarias")}>
                    <ArrowLeft /> Volver al listado
                </Button>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="0" p={4}>
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                    {isEditing ? "Editando: " : ""}{account.name ?? "Cuenta Bancaria"}
                </Text>

                <Box display="flex" gap={4}>
                    <IconButton padding={2} variant="ghost" color="brand.secondary" onClick={() => navigate("/tesoreria/cuentas-bancarias")}>
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
                        <LabelValue label="Saldo Actual" value={formatBalance(account.currentBalance)} />
                        <LabelValue label="Saldo Disponible" value={formatBalance(account.availableBalance)} />
                        <LabelValue label="ID del Banco" value={account.bankId != null ? String(account.bankId) : "-"} />
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
