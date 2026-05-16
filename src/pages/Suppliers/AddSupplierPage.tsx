
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    Field,
    Grid,
    Heading,
    Input,
    Portal,
    Select,
    Stack,
    Text,
    Checkbox,
} from "@chakra-ui/react";
import { createListCollection } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft } from "react-icons/lu";
import { useEffect, useMemo, useState } from "react";
import { useAllCategories } from "@/queries/catalog.queries";
import {
    useCreateSupplier,
    useEditSupplier,
    useGetSupplier,
    suppliersKeys,
} from "@/queries/suppliers.queries";
import { toaster } from "@/components/ui/toaster";

type CreateSupplierFormData = {
    ruc: string;
    businessName: string;
    fantasyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
    productCategoryIds?: number[];
};

export const AddSupplierPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id?: string }>();
    const supplierId = id ? Number(id) : undefined;
    const isEditMode = Boolean(supplierId);

    const { data: supplierData } = useGetSupplier(supplierId);
    const { data: categoriesData } = useAllCategories();
    const createSupplier = useCreateSupplier();
    const editSupplier = useEditSupplier();
    const [formError, setFormError] = useState<string | null>(null);

    const categoryCollection = useMemo(
        () =>
            createListCollection({
                items: (categoriesData?.productCategories ?? []).map((category) => ({
                    label: category.name,
                    value: String(category.id),
                })),
            }),
        [categoriesData],
    );

    const {
        register,
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSupplierFormData>({
        defaultValues: {
            ruc: "",
            businessName: "",
            fantasyName: "",
            email: "",
            phone: "",
            address: "",
            isActive: true,
            productCategoryIds: [],
        },
    });

    useEffect(() => {
        if (supplierData?.supplier) {
            const supplier = supplierData.supplier;

            reset({
                ruc: supplier.ruc,
                businessName: supplier.businessName,
                fantasyName: supplier.fantasyName ?? "",
                email: supplier.email ?? "",
                phone: supplier.phone ?? "",
                address: supplier.address ?? "",
                isActive: supplier.isActive,
                productCategoryIds: (supplier.productCategoryIds ?? []).map(Number),
            });
        }
    }, [supplierData, reset]);

    const handleSaveSupplier = (formData: CreateSupplierFormData) => {
        setFormError(null);

        const requestData = {
            ...formData,
            email: formData.email?.trim() ? formData.email.trim() : null,
            phone: formData.phone?.trim() ? formData.phone.trim() : null,
            address: formData.address?.trim() ? formData.address.trim() : null,
            fantasyName: formData.fantasyName?.trim() ? formData.fantasyName.trim() : null,
            productCategoryIds: formData.productCategoryIds ?? [],
            isActive: formData.isActive ?? false,
        };

        if (isEditMode && supplierId) {
            editSupplier.mutate(
                { id: supplierId, data: requestData },
                {
                    onSuccess: () => {
                        toaster.create({ title: "Proveedor actualizado con éxito" });
                        queryClient.invalidateQueries({
                            queryKey: suppliersKeys.suppliers,
                        });
                        navigate("/dash/proveedores");
                    },
                    onError: (error: any) => {
                        setFormError(
                            "Ha ocurrido un error al actualizar el proveedor: " +
                            error?.message,
                        );
                    },
                },
            );
            return;
        }

        createSupplier.mutate(requestData, {
            onSuccess: () => {
                toaster.create({ title: "Proveedor creado con éxito" });
                queryClient.invalidateQueries({ queryKey: suppliersKeys.suppliers });
                navigate("/dash/proveedores");
            },
            onError: (error: any) => {
                setFormError(
                    "Ha ocurrido un error al crear el proveedor: " + error?.message,
                );
            },
        });
    };

    return (
        <Stack gap={4} maxW="700px" p={4}>
            <Stack gap={1}>
                <Button
                    variant="ghost"
                    size="sm"
                    alignSelf="start"
                    onClick={() => navigate("/dash/proveedores")}
                >
                    <LuArrowLeft /> Volver a proveedores
                </Button>

                <Heading size="md">
                    {isEditMode ? "Editar proveedor" : "Nuevo proveedor"}
                </Heading>
            </Stack>

            <Stack as="form" onSubmit={handleSubmit(handleSaveSupplier)} gap={4}>
                <Grid templateColumns="1fr 1fr" gap={4}>

                    <Field.Root invalid={!!errors.ruc} gridColumn="1 / -1">
                        <Field.Label>
                            RUC <Text as="span" color="red.500">*</Text>
                        </Field.Label>
                        <Input
                            {...register("ruc", {
                                required: "El RUC es requerido",
                            })}
                            placeholder="RUC del proveedor"
                            disabled={createSupplier.isPending || editSupplier.isPending}
                        />
                        <Field.ErrorText>{errors.ruc?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.businessName} gridColumn="1 / -1">
                        <Field.Label>
                            Nombre o Razón social <Text as="span" color="red.500">*</Text>
                        </Field.Label>
                        <Input
                            {...register("businessName", {
                                required: "El nombre es requerido",
                            })}
                            placeholder="Nombre o razón social"
                            disabled={createSupplier.isPending || editSupplier.isPending}
                        />
                        <Field.ErrorText>{errors.businessName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Nombre de fantasía</Field.Label>
                        <Input
                            {...register("fantasyName")}
                            placeholder="Nombre de fantasía"
                        />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input
                            {...register("email")}
                            placeholder="Email"
                        />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Teléfono</Field.Label>
                        <Input
                            {...register("phone")}
                            placeholder="Teléfono de Contacto"
                        />
                    </Field.Root>

                    <Field.Root gridColumn="1 / -1">
                        <Field.Label>Dirección</Field.Label>
                        <Input
                            {...register("address")}
                            placeholder="Dirección"
                        />
                    </Field.Root>

                    <Field.Root gridColumn="1 / -1">
                        <Field.Label>Categorías de producto</Field.Label>

                        <Controller
                            name="productCategoryIds"
                            control={control}
                            render={({ field }) => (
                                <Select.Root
                                    collection={categoryCollection}
                                    value={(field.value ?? []).map(String)}
                                    multiple
                                    onValueChange={(event) =>
                                        field.onChange(event.value.map(Number))
                                    }
                                    disabled={createSupplier.isPending || editSupplier.isPending}
                                >
                                    <Select.HiddenSelect />
                                    <Select.Control>
                                        <Select.Trigger>
                                            <Select.ValueText placeholder="Seleccionar categorías" />
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Trigger>
                                    </Select.Control>

                                    <Portal>
                                        <Select.Positioner>
                                            <Select.Content>
                                                {categoryCollection.items.map((item) => (
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
                    </Field.Root>

                    <Field.Root>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Root
                                    checked={field.value}
                                    onCheckedChange={(e) => field.onChange(e.checked)}
                                    disabled={createSupplier.isPending || editSupplier.isPending}
                                >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control />
                                    <Checkbox.Label>Proveedor activo</Checkbox.Label>
                                </Checkbox.Root>
                            )}
                        />
                    </Field.Root>

                </Grid>

                {formError && (
                    <Text color="red.500" fontSize="sm">
                        {formError}
                    </Text>
                )}

                <Button
                    type="submit"
                    bgColor="brand.primary"
                    color="white"
                    size="md"
                    disabled={createSupplier.isPending || editSupplier.isPending}
                >
                    {createSupplier.isPending || editSupplier.isPending
                        ? "Guardando..."
                        : isEditMode
                            ? "Guardar cambios"
                            : "Crear proveedor"}
                </Button>
            </Stack>
        </Stack>
    );
};