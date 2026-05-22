import { type AccountResponseDto } from "@/api/bankAccounts.api";
import { useCreateMovement } from "@/queries/bankMovements.queries";
import { useGetAccounts } from "@/queries/bankAccounts.queries";
import { createMovementSchema, type CreateMovementFormData } from "@/schemas/bankMovements.schema";
import { toaster } from "@/components/ui/toaster";
import {
    Button,
    createListCollection,
    Field,
    Flex,
    Grid,
    GridItem,
    Heading,
    Input,
    Portal,
    Select,
    Stack,
    Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export default function MovementCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate: createMovement, isPending } = useCreateMovement();
    const { data: accountsData } = useGetAccounts({ page: 1, pageSize: 100 });

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
        formState: { errors },
    } = useForm<CreateMovementFormData>({
        resolver: zodResolver(createMovementSchema),
        defaultValues: {
            bankAccountId: 0,
            amount: 0,
            description: "",
            date: new Date().toISOString().slice(0, 16),
        },
    });

    const handleCreate = (formData: CreateMovementFormData) => {
        createMovement({ ...formData, date: new Date(formData.date).toISOString() }, {
            onSuccess: () => {
                toaster.create({ title: "Movimiento bancario creado con éxito" });
                queryClient.invalidateQueries({ queryKey: ["bankMovements"] });
                navigate("/tesoreria/movimientos");
            },
            onError: (error) => {
                toaster.create({
                    title: "Error al crear el movimiento bancario",
                    description: error.message,
                    type: "error",
                });
            },
        });
    };

    return (
        <Stack gap={4} paddingInline="15%">
            <Flex alignItems="center" justifyContent="space-between">
                <Heading size="xl">Nuevo Movimiento Bancario</Heading>
                <Button variant="ghost" size="sm" alignSelf="start" onClick={() => navigate("/tesoreria/movimientos")}>
                    <LuArrowLeft /> Volver al listado
                </Button>
            </Flex>

            <Stack as="form" onSubmit={handleSubmit(handleCreate)} gap={4}>
                <Grid templateColumns="2fr 2fr" gap={4} alignItems="center">
                    <GridItem colSpan={2}>
                        <Field.Root invalid={!!errors.bankAccountId} required>
                            <Field.Label>Cuenta Bancaria</Field.Label>
                            <Controller
                                name="bankAccountId"
                                control={control}
                                render={({ field }) => (
                                    <Select.Root
                                        collection={accountCollection}
                                        value={field.value ? [String(field.value)] : []}
                                        onValueChange={(e) => field.onChange(Number(e.value[0]))}
                                        disabled={isPending}
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
                    </GridItem>

                    <GridItem colSpan={2}>
                        <Field.Root invalid={!!errors.amount} required>
                            <Field.Label>Monto</Field.Label>
                            <Input
                                {...register("amount", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min={0}
                                placeholder="0.00"
                                disabled={isPending}
                            />
                            <Field.ErrorText>{errors.amount?.message}</Field.ErrorText>
                        </Field.Root>
                    </GridItem>

                    <GridItem colSpan={4}>
                        <Field.Root invalid={!!errors.description}>
                            <Field.Label>Descripción</Field.Label>
                            <Input
                                {...register("description")}
                                placeholder="Descripción del movimiento"
                                disabled={isPending}
                            />
                            <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
                        </Field.Root>
                    </GridItem>

                    <GridItem colSpan={2}>
                        <Field.Root invalid={!!errors.date} required>
                            <Field.Label>Fecha</Field.Label>
                            <Input
                                {...register("date")}
                                type="datetime-local"
                                disabled={isPending}
                            />
                            <Field.ErrorText>{errors.date?.message}</Field.ErrorText>
                        </Field.Root>
                    </GridItem>
                </Grid>

                {isPending && (
                    <Text color="gray.500" fontSize="sm">
                        Creando movimiento bancario...
                    </Text>
                )}

                <Button type="submit" colorPalette="brand" loading={isPending} alignSelf="start">
                    <LuSave /> Guardar Movimiento
                </Button>
            </Stack>
        </Stack>
    );
}
