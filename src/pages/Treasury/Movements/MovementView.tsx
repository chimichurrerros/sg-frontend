import { type AccountResponseDto } from "@/api/bankAccounts.api";
import { useGetMovementById, useUpdateMovement, useDeleteMovement } from "@/queries/bankMovements.queries";
import { useGetAccounts } from "@/queries/bankAccounts.queries";
import { createMovementSchema, type CreateMovementFormData } from "@/schemas/bankMovements.schema";
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
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

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

const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString("es-PY", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export default function MovementView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const movementId = Number(id);
    const [isEditing, setIsEditing] = useState(false);

    const { data: movement, isPending, isError, error } = useGetMovementById(movementId);
    const { data: accountsData } = useGetAccounts({ page: 1, pageSize: 100 });
    const { mutate: updateMovement, isPending: isUpdating } = useUpdateMovement(movementId);
    const { mutate: deleteMovement } = useDeleteMovement();

    const accountCollection = useMemo(() =>
        createListCollection({
            items: (accountsData?.accounts ?? []).map((a: AccountResponseDto) => ({
                label: a.name ?? `Cuenta #${a.id}`,
                value: String(a.id),
            })),
        }),
    [accountsData]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateMovementFormData>({
        resolver: zodResolver(createMovementSchema),
    });

    useEffect(() => {
        if (movement) {
            reset({
                accountId: movement.bankAccountId,
                bankAccountId: movement.bankAccountId,
                amount: movement.amount,
                description: movement.description ?? "",
                date: movement.date.slice(0, 16),
            });
        }
    }, [movement, reset]);

    useEffect(() => {
        if (isError) {
            toaster.create({
                title: "Error al cargar el movimiento bancario",
                description: error?.message || "Error desconocido",
                type: "error",
            });
        }
    }, [isError, error]);

    const handleSave = (formData: CreateMovementFormData) => {
        updateMovement({ ...formData, accountId: formData.bankAccountId, date: new Date(formData.date).toISOString() }, {
            onSuccess: () => {
                toaster.create({ title: "Movimiento bancario actualizado con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankMovements"] });
                setIsEditing(false);
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al actualizar el movimiento bancario",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    const handleDelete = () => {
        if (!movement) return;
        deleteMovement(movement.id, {
            onSuccess: () => {
                toaster.create({ title: "Movimiento bancario eliminado con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankMovements"] });
                navigate("/tesoreria/movimientos");
            },
            onError: (err) => {
                toaster.create({
                    title: "Error al eliminar el movimiento bancario",
                    description: err.message,
                    type: "error",
                });
            },
        });
    };

    if (isPending) {
        return (
            <Box p={4}>
                <Text>Cargando movimiento bancario...</Text>
            </Box>
        );
    }

    if (isError || !movement) {
        return (
            <Box p={4}>
                <Text color="red.500">Error al cargar el movimiento bancario.</Text>
                <Button mt={4} variant="ghost" onClick={() => navigate("/tesoreria/movimientos")}>
                    <ArrowLeft /> Volver al listado
                </Button>
            </Box>
        );
    }

    const accountName = (accountsData?.accounts ?? []).find(
        (a: AccountResponseDto) => a.id === movement.bankAccountId
    )?.name ?? `Cuenta #${movement.bankAccountId}`;

    return (
        <Box display="flex" flexDirection="column" minHeight="0" p={4}>
            <Box display="flex" flexDirection="row" gap={4} py={2} justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                    {isEditing ? "Editando: " : ""}Movimiento N° {movement.id}
                </Text>

                <Box display="flex" gap={4}>
                    <IconButton padding={2} variant="ghost" color="brand.secondary" onClick={() => navigate("/tesoreria/movimientos")}>
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
                        <LabelValue label="ID" value={String(movement.id)} />
                        <LabelValue label="Cuenta Bancaria" value={accountName} />
                        <LabelValue label="Monto" value={formatBalance(movement.amount)} />
                        <LabelValue label="Descripción" value={movement.description ?? "-"} />
                        <LabelValue label="Fecha" value={formatDate(movement.date)} />
                    </Grid>
                </Box>
            ) : (
                <Box bg="white" h="full" w="100%">
                    <Stack as="form" onSubmit={handleSubmit(handleSave)} gap={4} maxW="600px">
                        <Field.Root invalid={!!errors.bankAccountId} required>
                            <Field.Label>Cuenta Bancaria</Field.Label>
                            <Controller
                                name="bankAccountId"
                                control={control}
                                render={({ field }) => (
                                    <Select.Root
                                        collection={accountCollection}
                                        value={[String(field.value)]}
                                        onValueChange={(e) => field.onChange(Number(e.value[0]))}
                                        disabled={isUpdating}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Seleccionar cuenta bancaria" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.ClearTrigger />
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {accountCollection.items.map((item) => (
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
                            <Field.ErrorText>{errors.bankAccountId?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.amount} required>
                            <Field.Label>Monto</Field.Label>
                            <Input
                                {...register("amount", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min={0}
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.amount?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.description}>
                            <Field.Label>Descripción</Field.Label>
                            <Input
                                {...register("description")}
                                placeholder="Descripción del movimiento"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.date} required>
                            <Field.Label>Fecha</Field.Label>
                            <Input
                                {...register("date")}
                                type="datetime-local"
                                disabled={isUpdating}
                            />
                            <Field.ErrorText>{errors.date?.message}</Field.ErrorText>
                        </Field.Root>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
