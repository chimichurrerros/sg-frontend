import { bankMovementTypeMap, type BankResponseDto } from "@/api/banks.api";
import { useGetBankById, useUpdateBank, useDeleteBank } from "@/queries/banks.queries";
import { createBankSchema, type CreateBankFormData } from "@/schemas/banks.schema";
import { toaster } from "@/components/ui/toaster";
import { accountTypeMap } from "@/api/bankAccounts.api";
import TableSelect, { type label } from "@/components/ui/table-select";
import type { BankAccountResponseDto } from "@/api/banks.api";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
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
    items: Object.entries(bankMovementTypeMap).map(([value, label]) => ({
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

const bankAccountLabels: label<BankAccountResponseDto>[] = [
    { labelName: "Nombre", propName: "name", textIfNull: "-" },
    {
        labelName: "Tipo",
        propName: "accountType",
        transformFunction: (value: number) => accountTypeMap[value] || "Desconocido",
    },
    {
        labelName: "Saldo Actual",
        propName: "currentBalance",
        transformFunction: (value: number) => formatBalance(value),
    },
    {
        labelName: "Saldo Disponible",
        propName: "availableBalance",
        transformFunction: (value: number) => formatBalance(value),
    },
];

export default function BankView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const bankId = Number(id);
    const [isEditing, setIsEditing] = useState(false);

    const { data: bank, isPending, isError, error } = useGetBankById(bankId);
    const { mutate: updateBank, isPending: isUpdating } = useUpdateBank(bankId);
    const { mutate: deleteBank } = useDeleteBank();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateBankFormData>({
        resolver: zodResolver(createBankSchema),
    });

    useEffect(() => {
        if (bank) {
            reset({
                name: bank.name ?? "",
                accountNumber: bank.accountNumber ?? "",
                accountType: bank.accountType,
                ruc: bank.ruc ?? "",
            });
        }
    }, [bank, reset]);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar el banco",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    const handleSave = (formData: CreateBankFormData) => {
        updateBank(formData, {
            onSuccess: () => {
                toaster.create({ title: "Banco actualizado con éxito" });
                queryClient.invalidateQueries({ queryKey: ["banks"] });
                setIsEditing(false);
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al actualizar el banco",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    const handleDelete = () => {
        if (!bank) return;
        deleteBank(bank.id, {
            onSuccess: () => {
                toaster.create({ title: "Banco eliminado con éxito" });
                queryClient.invalidateQueries({ queryKey: ["banks"] });
                navigate("/tesoreria/bancos");
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al eliminar el banco",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    if (isPending) {
        return (
            <Box p={4}>
                <Text>Cargando banco...</Text>
            </Box>
        );
    }

    if (isError || !bank) {
        return (
            <Box p={4}>
                <Text color="red.500">Error al cargar el banco.</Text>
                <Button mt={4} variant="ghost" onClick={() => navigate("/tesoreria/bancos")}>
                    <ArrowLeft /> Volver al listado
                </Button>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="0" p={4}>
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                    {isEditing ? "Editando: " : ""}{bank.name ?? "Banco"}
                </Text>

                <Box display="flex" gap={4}>
                    <IconButton padding={2} variant="ghost" color="brand.secondary" onClick={() => navigate("/tesoreria/bancos")}>
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
                        <LabelValue label="ID" value={String(bank.id)} />
                        <LabelValue label="Nombre" value={bank.name ?? "-"} />
                        <LabelValue label="Nro. Cuenta" value={bank.accountNumber ?? "-"} />
                        <LabelValue label="Tipo" value={bankMovementTypeMap[bank.accountType] || "Desconocido"} />
                        <LabelValue label="RUC" value={bank.ruc ?? "-"} />
                        <LabelValue label="Activo" value={bank.isActive ? "Sí" : "No"} />
                    </Grid>

                    <Text fontSize="lg" fontWeight="semibold" mt={6} mb={3}>
                        Cuentas Bancarias Asociadas
                    </Text>
                    <TableSelect
                        data={bank.accounts ?? []}
                        loading={false}
                        labels={bankAccountLabels}
                        onSelect={() => {}}
                        minheight="200px"
                        noItemsComponent={
                            <EmptyDataScreen
                                title="Sin cuentas bancarias"
                                message="Este banco no tiene cuentas bancarias asociadas."
                                icon={<></>}
                            />
                        }
                    />
                </Box>
            ) : (
                <Box bg="white" h="full" w="100%">
                    <Stack as="form" onSubmit={handleSubmit(handleSave)} gap={4} maxW="600px">
                        <Field.Root invalid={!!errors.name} required>
                            <Field.Label>Nombre</Field.Label>
                            <Input
                                {...register("name")}
                                placeholder="Nombre del banco"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.accountNumber} required>
                            <Field.Label>Número de Cuenta</Field.Label>
                            <Input
                                {...register("accountNumber")}
                                placeholder="000-000000-0"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.accountNumber?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.accountType} required>
                            <Field.Label>Tipo de Cuenta Bancaria</Field.Label>
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
                                                <Select.ValueText placeholder="Seleccionar tipo" />
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

                        <Field.Root invalid={!!errors.ruc} required>
                            <Field.Label>RUC</Field.Label>
                            <Input
                                {...register("ruc")}
                                placeholder="0000000-0"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.ruc?.message}</Field.ErrorText>
                        </Field.Root>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
