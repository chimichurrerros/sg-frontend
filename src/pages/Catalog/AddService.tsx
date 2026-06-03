import { CurrencyInput } from "@/components/ui/currency-input";
import { toaster } from "@/components/ui/toaster";
import {
  useAllServices,
  useCreateService,
  useGetService,
  useUpdateService,
} from "@/queries/catalog.queries";
import {
  createServiceSchema,
  type CreateServiceFormData,
} from "@/schemas/catalog.schema";
import {
  Button,
  ButtonGroup,
  Field,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
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

export const AddService = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const serviceId = id ? Number(id) : undefined;
  const isEditMode = Boolean(serviceId);

  const [formError, setFormError] = useState<string | null>(null);

  const { mutate: createService, isPending: isCreatePending } = useCreateService();
  const { mutate: updateService, isPending: isUpdatePending } = useUpdateService();
  const { data: serviceData } = useGetService(serviceId);

  const isPending = isCreatePending || isUpdatePending;

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      barcode: "",
      price: 0,
      cost: 0,
    },
  });

  useEffect(() => {
    if (serviceData?.service) {
      const svc = serviceData.service;
      reset({
        name: svc.name,
        description: svc.description ?? "",
        barcode: svc.barcode ?? "",
        price: svc.price,
        cost: svc.cost,
      });
    }
  }, [serviceData, reset]);

  const handleSave = (formData: CreateServiceFormData) => {
    setFormError(null);

    if (isEditMode && serviceId) {
      updateService(
        { id: serviceId, data: formData },
        {
          onSuccess: () => {
            toaster.create({ title: "Servicio actualizado con éxito" });
            queryClient.invalidateQueries({ queryKey: ["services"] });
            navigate("/dash/catalogo");
          },
          onError: (error) => {
            setFormError(
              "Ha ocurrido un error al actualizar el servicio: " + error.message,
            );
          },
        },
      );
      return;
    }

    createService(formData, {
      onSuccess: () => {
        toaster.create({ title: "Servicio creado con éxito" });
        queryClient.invalidateQueries({ queryKey: ["services"] });
        navigate("/dash/catalogo");
      },
      onError: (error) => {
        setFormError(
          "Ha ocurrido un error al crear el servicio: " + error.message,
        );
      },
    });
  };

  return (
    <Stack gap={4} paddingInline="15%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">
          {isEditMode ? "Editar servicio" : "Nuevo servicio"}
        </Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/dash/catalogo")}
        >
          <LuArrowLeft /> Volver al catálogo
        </Button>
      </Flex>

      <Stack as="form" onSubmit={handleSubmit(handleSave)} gap={4}>
        <Grid templateColumns="2fr 2fr" gap={4} alignItems="center">
          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.name} required>
              <Input
                {...register("name")}
                placeholder="Nombre del servicio"
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
        </Grid>

        {formError && (
          <Text color="red.500" fontSize="sm">
            {formError}
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
            <LuSave /> {isEditMode ? "Guardar cambios" : "Guardar servicio"}
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
};
