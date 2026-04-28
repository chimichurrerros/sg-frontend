import { toaster } from "@/components/ui/toaster";
import {
  useAllBrands,
  useAllCategories,
  useCreateProduct,
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
  Grid,
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
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const AddProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createError, setCreateError] = useState<string | null>(null);

  const { mutate: createProduct, isPending } = useCreateProduct();
  const { data: categoriesData } = useAllCategories();
  const { data: brandsData } = useAllBrands();

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

  const handleCreate = (formData: CreateProductFormData) => {
    setCreateError(null);
    createProduct(formData, {
      onSuccess: () => {
        toaster.create({ title: "Producto creado con éxito" });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        navigate("/dash/catalogo");
      },
      onError: (error) => {
        setCreateError(
          "Ha ocurrido un error al crear el producto: " + error.message,
        );
      },
    });
  };

  return (
    <Stack gap={4} maxW="600px">
      <Stack gap={1}>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/dash/catalogo")}
        >
          <LuArrowLeft /> Volver al catálogo
        </Button>
        <Heading size="md">Nuevo producto</Heading>
      </Stack>

      <Stack as="form" onSubmit={handleSubmit(handleCreate)} gap={4}>
        <Grid templateColumns="1fr 1fr" gap={4}>
          <Field.Root invalid={!!errors.name} required gridColumn="1 / -1">
            <Field.Label>Nombre</Field.Label>
            <Input
              {...register("name")}
              placeholder="Nombre del producto"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.barcode} required gridColumn="1 / -1">
            <Field.Label>Código de barras</Field.Label>
            <Input
              {...register("barcode")}
              placeholder="Código de barras del producto"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.description} gridColumn="1 / -1">
            <Field.Label>Descripción</Field.Label>
            <Textarea
              {...register("description")}
              placeholder="Descripción del producto"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.barcode} required gridColumn="1 / -1">
            <Field.Label>Código de barras</Field.Label>
            <Input
              {...register("barcode")}
              placeholder="Código de barras"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.barcode?.message}</Field.ErrorText>
          </Field.Root>

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
            <Field.ErrorText>{errors.productBrandId?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.price} required>
            <Field.Label>Precio</Field.Label>
            <Input
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.price?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.cost} required>
            <Field.Label>Costo</Field.Label>
            <Input
              {...register("cost", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              disabled={isPending}
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
            onClick={() => navigate("/dash/catalogo")}
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
