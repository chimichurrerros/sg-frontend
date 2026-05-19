import {
  createBankSchema,
  type CreateBankFormData,
} from "@/schemas/banks.schema";
import { useCreateBank } from "@/queries/banks.queries";
import { bankMovementTypeMap } from "@/api/banks.api";
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
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const accountTypeCollection = createListCollection({
  items: Object.entries(bankMovementTypeMap).map(([value, label]) => ({
    label,
    value,
  })),
});

export default function BankCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createBank, isPending } = useCreateBank();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBankFormData>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: "",
      accountNumber: "",
      accountType: 1,
      ruc: "",
    },
  });

  const handleCreate = (formData: CreateBankFormData) => {
    createBank(formData, {
      onSuccess: () => {
        toaster.create({ title: "Banco creado con éxito" });
        queryClient.invalidateQueries({ queryKey: ["banks"] });
        navigate("/tesoreria/bancos");
      },
      onError: (error) => {
        toaster.create({
          title: "Error al crear el banco",
          description: error.message,
          type: "error",
        });
      },
    });
  };

  return (
    <Stack gap={4} paddingInline="15%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">Nuevo Banco</Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/tesoreria/bancos")}
        >
          <LuArrowLeft /> Volver al listado
        </Button>
      </Flex>

      <Stack as="form" onSubmit={handleSubmit(handleCreate)} gap={4}>
        <Grid templateColumns="2fr 2fr" gap={4} alignItems="center">
          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.name} required>
              <Input
                {...register("name")}
                placeholder="Nombre del banco"
                disabled={isPending}
                variant="flushed"
                size="lg"
              />
              <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.accountNumber} required>
              <Field.Label>Número de Cuenta</Field.Label>
              <Input
                {...register("accountNumber")}
                placeholder="000-000000-0"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.accountNumber?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
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
                    disabled={isPending}
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
          </GridItem>

          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.ruc} required>
              <Field.Label>RUC</Field.Label>
              <Input
                {...register("ruc")}
                placeholder="0000000-0"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.ruc?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>
        </Grid>

        {isPending && (
          <Text color="gray.500" fontSize="sm">
            Creando banco...
          </Text>
        )}

        <Button
          type="submit"
          colorPalette="brand"
          loading={isPending}
          alignSelf="start"
        >
          <LuSave /> Guardar Banco
        </Button>
      </Stack>
    </Stack>
  );
}
