import {
  createAccountSchema,
  type CreateAccountFormData,
} from "@/schemas/bankAccounts.schema";
import { useCreateAccount } from "@/queries/bankAccounts.queries";
import { useGetBanks } from "@/queries/banks.queries";
import { accountTypeMap, type CreateAccountRequestDto } from "@/api/bankAccounts.api";
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
  items: Object.entries(accountTypeMap).map(([value, label]) => ({
    label,
    value,
  })),
});

export default function BankAccountCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createAccount, isPending } = useCreateAccount();
  const { data: banks } = useGetBanks();

  const bankCollection = createListCollection({
    items: (banks?.banks ?? []).map((bank) => ({
      label: bank.name ?? `Banco #${bank.id}`,
      value: String(bank.id),
    })),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      accountType: 0,
      currentBalance: 0,
      availableBalance: 0,
      accountNumber: "",
      bankId: undefined,
    },
  });

  const handleCreate = (formData: CreateAccountFormData) => {
    const apiData: CreateAccountRequestDto = {
      name: formData.name || null,
      accountType: formData.accountType,
      currentBalance: formData.currentBalance,
      availableBalance: formData.availableBalance,
      accountNumber: formData.accountNumber || null,
      bankId: formData.bankId ?? null,
    };
    createAccount(apiData, {
      onSuccess: () => {
        toaster.create({ title: "Cuenta bancaria creada con éxito" });
        queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
        navigate("/tesoreria/cuentas-bancarias");
      },
      onError: (error) => {
        toaster.create({
          title: "Error al crear la cuenta bancaria",
          description: error.message,
          type: "error",
        });
      },
    });
  };

  return (
    <Stack gap={4} paddingInline="15%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">Nueva Cuenta Bancaria</Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/tesoreria/cuentas-bancarias")}
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
                placeholder="Nombre de la cuenta"
                disabled={isPending}
                variant="flushed"
                size="lg"
              />
              <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
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
                    disabled={isPending}
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
          </GridItem>

          <GridItem colSpan={2}>
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
                    disabled={isPending}
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
          </GridItem>

          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.accountNumber}>
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
            <Field.Root invalid={!!errors.currentBalance} required>
              <Field.Label>Saldo Actual</Field.Label>
              <Input
                {...register("currentBalance", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                disabled={isPending}
              />
              <Field.ErrorText>
                {errors.currentBalance?.message}
              </Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.availableBalance} required>
              <Field.Label>Saldo Disponible</Field.Label>
              <Input
                {...register("availableBalance", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                disabled={isPending}
              />
              <Field.ErrorText>
                {errors.availableBalance?.message}
              </Field.ErrorText>
            </Field.Root>
          </GridItem>
        </Grid>

        {isPending && (
          <Text color="gray.500" fontSize="sm">
            Creando cuenta bancaria...
          </Text>
        )}

        <Button
          type="submit"
          colorPalette="brand"
          loading={isPending}
          alignSelf="start"
        >
          <LuSave /> Guardar Cuenta Bancaria
        </Button>
      </Stack>
    </Stack>
  );
}
