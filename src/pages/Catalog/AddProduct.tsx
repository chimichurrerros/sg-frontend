import { CurrencyInput } from "@/components/ui/currency-input";
import { toaster } from "@/components/ui/toaster";
import {
  useAllBrands,
  useAllCategories,
  useCreateProduct,
  useGetProduct,
  useUpdateProduct,
} from "@/queries/catalog.queries";
import {
  createProductSchema,
  type CreateProductFormData,
} from "@/schemas/catalog.schema";
import {
  Button,
  ButtonGroup,
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
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";

export const AddProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const productId = id ? Number(id) : undefined;
  const isEditMode = Boolean(productId);

  const [createError, setCreateError] = useState<string | null>(null);

  const { mutate: createProduct, isPending: isCreatePending } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatePending } = useUpdateProduct();
  const { data: productData } = useGetProduct(productId);
  const { data: categoriesData } = useAllCategories();
  const { data: brandsData } = useAllBrands();

  const isPending = isCreatePending || isUpdatePending;

  const categoryCollection = createListCollection({
    items: (categoriesData?.productCategories ?? []).map((c) => ({
      label: c.name,
      value: String(c.id),
    })),
  });

  const brandCollection = createListCollection({
    items: (brandsData?.productBrands ?? []).map((b) => ({
      label: b.name,
      value: String(b.id),
    })),
  });

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      barcode: "",
      productCategoryId: 0,
      productBrandId: 0,
      price: 0,
      cost: 0,
      minimumStock: 0,
    },
  });

  useEffect(() => {
    if (productData?.product) {
      const p = productData.product;
      reset({
        name: p.name ?? "",
        description: p.description ?? "",
        barcode: p.barcode ?? "",
        productCategoryId: p.productCategoryId ?? 0,
        productBrandId: p.productBrandId ?? 0,
        price: p.price,
        cost: p.cost ?? 0,
        minimumStock: p.minimumStock ?? 0,
      });
    }
  }, [productData, reset]);

  const handleCreate = (formData: CreateProductFormData) => {
    setCreateError(null);

    if (isEditMode && productId) {
      updateProduct(
        { id: productId, data: formData },
        {
          onSuccess: () => {
            toaster.create({ title: "Producto actualizado con éxito" });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            navigate("/catalogo");
          },
          onError: (error) => {
            setCreateError(
              "Ha ocurrido un error al actualizar el producto: " + error.message,
            );
          },
        },
      );
      return;
    }

    createProduct(formData, {
      onSuccess: () => {
        toaster.create({ title: "Producto creado con éxito" });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        navigate("/catalogo");
      },
      onError: (error) => {
        setCreateError(
          "Ha ocurrido un error al crear el producto: " + error.message,
        );
      },
    });
  };

  return (
    <Stack gap={4} paddingInline="15%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">
          {isEditMode ? "Editar producto" : "Nuevo producto"}
        </Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/catalogo")}
        >
          <LuArrowLeft /> Volver al catálogo
        </Button>
      </Flex>

      <Stack as="form" onSubmit={handleSubmit(handleCreate)} gap={4}>
        <Grid templateColumns="2fr 2fr" gap={4} alignItems="center">
          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.name} required>
              <Input
                {...register("name")}
                placeholder="Nombre del producto"
                disabled={isPending}
                variant="flushed"
                size="lg"
              />
              <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={3}>
            <Field.Root invalid={!!errors.description}>
              <Textarea
                {...register("description")}
                placeholder="Descripción"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <Field.Root invalid={!!errors.barcode} required>
            <Field.Label>Código de barras</Field.Label>
            <Input
              {...register("barcode")}
              placeholder="5449000009067"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.barcode?.message}</Field.ErrorText>
          </Field.Root>

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.productCategoryId} required>
              <Field.Label>Categoría</Field.Label>
              <Controller
                name="productCategoryId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={categoryCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(e) => field.onChange(Number(e.value[0]))}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar categoría" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
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
              <Field.ErrorText>
                {errors.productCategoryId?.message}
              </Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.productBrandId} required>
              <Field.Label>Marca</Field.Label>
              <Controller
                name="productBrandId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={brandCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(e) => field.onChange(Number(e.value[0]))}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar marca" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {brandCollection.items.map((item) => (
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
              <Field.ErrorText>
                {errors.productBrandId?.message}
              </Field.ErrorText>
            </Field.Root>
          </GridItem>

          <Field.Root invalid={!!errors.price} required>
            <Field.Label>Precio</Field.Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onValueChange={(v) => field.onChange(isNaN(v) ? 0 : v)}
                  disabled={isPending}
                  invalid={!!errors.price}
                  min={0}
                />
              )}
            />
            <Field.ErrorText>{errors.price?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.cost} required>
            <Field.Label>Costo</Field.Label>
            <Controller
              name="cost"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onValueChange={(v) => field.onChange(isNaN(v) ? 0 : v)}
                  disabled={isPending}
                  invalid={!!errors.cost}
                  min={0}
                />
              )}
            />
            <Field.ErrorText>{errors.cost?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.minimumStock} required>
            <Field.Label>Stock mínimo</Field.Label>
            <Input
              {...register("minimumStock", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="0"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.minimumStock?.message}</Field.ErrorText>
          </Field.Root>
        </Grid>

        {createError && (
          <Text color="red.500" fontSize="sm">
            {createError}
          </Text>
        )}

        <ButtonGroup alignSelf="end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/catalogo")}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" bgColor="brand.primary" loading={isPending}>
            <LuSave /> Guardar producto
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
};
