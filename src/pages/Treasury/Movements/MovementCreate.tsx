import { type AccountResponseDto } from "@/api/accounts.api";
import { movementTypeMap } from "@/api/bankMovements.api";
import { checkTypeEnum } from "@/api/checks.api";
import { useCreateMovement } from "@/queries/bankMovements.queries";
import { useGetAccounts } from "@/queries/accounts.queries";
import { useGetBanks } from "@/queries/banks.queries";
import {
  createMovementSchema,
  type CreateMovementFormData,
} from "@/schemas/bankMovements.schema";
import { toaster } from "@/components/ui/toaster";
import {
  Button,
  Checkbox,
  createListCollection,
  Field,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  InputGroup,
  NumberInput,
  Portal,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { RadioGroupWrapper } from "@/components/ui/radio-group-wrapper";

export default function MovementCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createMovement, isPending } = useCreateMovement();
  const { data: accountsData } = useGetAccounts({ page: 1, pageSize: 100 });
  const { data: banksData } = useGetBanks();

  const accountCollection = createListCollection({
    items: (accountsData?.accounts ?? []).map((a: AccountResponseDto) => ({
      label: a.name ?? `Cuenta #${a.id}`,
      value: String(a.id),
    })),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMovementFormData>({
    resolver: zodResolver(createMovementSchema),
    defaultValues: {
      accountId: 0,
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 16),
      movementType: 1,
      checkDetails: undefined,
    },
  });

  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (showCheck) {
      const today = new Date().toISOString().slice(0, 10);
      setValue("checkDetails.emisionDate", today);
      setValue("checkDetails.availabilityDate", today);
    }
  }, [showCheck, setValue]);

  const currentAmount = watch("amount");

  useEffect(() => {
    if (showCheck) {
      setValue("checkDetails.amount", currentAmount);
    }
  }, [currentAmount, showCheck, setValue]);

  const currentAccountId = watch("accountId");
  const currentMovementType = watch("movementType");

  useEffect(() => {
    if (!showCheck) return;

    const selectedAccount = (accountsData?.accounts ?? []).find(
      (a: AccountResponseDto) => a.id === currentAccountId,
    );

    if (currentMovementType === 1) {
      if (selectedAccount) {
        const bank = (banksData?.banks ?? []).find(
          (b) => b.id === selectedAccount.bankId,
        );
        setValue("checkDetails.issuingBank", bank?.name ?? "");
        setValue("checkDetails.receiver", "");
      } else {
        setValue("checkDetails.issuingBank", "");
      }
    }

    if (currentMovementType === 2) {
      setValue("checkDetails.receiver", selectedAccount?.name ?? "");
      setValue("checkDetails.issuingBank", "");
    }
  }, [
    showCheck,
    currentAccountId,
    currentMovementType,
    accountsData,
    banksData,
    setValue,
  ]);

  const handleCreate = (formData: CreateMovementFormData) => {
    createMovement(
      {
        ...formData,
        date: new Date(formData.date).toISOString(),
        checkDetails:
          showCheck && formData.checkDetails?.emisionDate
            ? { ...formData.checkDetails, accountId: formData.accountId }
            : null,
      },
      {
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
      },
    );
  };

  return (
    <Stack gap={4} paddingInline="15%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">Nuevo Movimiento Bancario</Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/tesoreria/movimientos")}
        >
          <LuArrowLeft /> Volver al listado
        </Button>
      </Flex>

      <Stack as="form" onSubmit={handleSubmit(handleCreate)} gap={4}>
        <Grid templateColumns="1fr 1fr" gap={4} alignItems="center">
          <GridItem>
            <Field.Root invalid={!!errors.accountId} required>
              <Field.Label>Cuenta</Field.Label>
              <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={accountCollection}
                    value={[String(field.value)]}
                    onValueChange={(e) => field.onChange(e.value.length > 0 ? Number(e.value[0]) : 0)}
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
              <Field.ErrorText>{errors.accountId?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem>
            <Field.Root invalid={!!errors.date} required>
              <Field.Label>Fecha del movimiento</Field.Label>
              <Input
                {...register("date")}
                type="datetime-local"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.date?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem>
            <Field.Root invalid={!!errors.amount} required>
              <Field.Label>Monto</Field.Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumberInput.Root
                    value={String(field.value ?? 0)}
                    onValueChange={(details) =>
                      field.onChange(
                        isNaN(details.valueAsNumber)
                          ? 0
                          : details.valueAsNumber,
                      )
                    }
                    formatOptions={{ style: "decimal" }}
                    locale="es-PY"
                    min={0}
                    disabled={isPending}
                    invalid={!!errors.amount}
                  >
                    <InputGroup startElement="Gs.">
                      <NumberInput.Input />
                    </InputGroup>
                  </NumberInput.Root>
                )}
              />
              <Field.ErrorText>{errors.amount?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem>
            <Field.Root invalid={!!errors.movementType} required>
              <Field.Label>Tipo de movimiento</Field.Label>
              <Controller
                name="movementType"
                control={control}
                render={({ field }) => (
                  <RadioGroupWrapper
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                    options={Object.entries(movementTypeMap).map(
                      ([value, label]) => ({ value, label }),
                    )}
                  />
                )}
              />
              <Field.ErrorText>{errors.movementType?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
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
        </Grid>

        <Checkbox.Root
          checked={showCheck}
          onCheckedChange={(e) => setShowCheck(!!e.checked)}
          disabled={isPending}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Movimiento con cheque</Checkbox.Label>
        </Checkbox.Root>

        {showCheck && (
          <Grid templateColumns="1fr 1fr" gap={4} alignItems="center">
            <GridItem>
              <Field.Root invalid={!!errors.checkDetails?.number}>
                <Field.Label>Número de Cheque</Field.Label>
                <Input
                  {...register("checkDetails.number")}
                  placeholder="00012345"
                  disabled={isPending}
                />
                <Field.ErrorText>
                  {errors.checkDetails?.number?.message}
                </Field.ErrorText>
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root invalid={!!errors.checkDetails?.type}>
                <Field.Label>Tipo</Field.Label>
                <Controller
                  name="checkDetails.type"
                  control={control}
                  render={({ field }) => (
                    <RadioGroupWrapper
                      value={
                        field.value != null ? String(field.value) : undefined
                      }
                      onValueChange={(value) => field.onChange(Number(value))}
                      options={Object.entries(checkTypeEnum).map(
                        ([value, label]) => ({ value, label }),
                      )}
                    />
                  )}
                />
                <Field.ErrorText>
                  {errors.checkDetails?.type?.message}
                </Field.ErrorText>
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root invalid={!!errors.checkDetails?.emisionDate}>
                <Field.Label>Fecha de Emisión</Field.Label>
                <Input
                  {...register("checkDetails.emisionDate")}
                  type="date"
                  disabled={isPending}
                />
                <Field.ErrorText>
                  {errors.checkDetails?.emisionDate?.message}
                </Field.ErrorText>
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root invalid={!!errors.checkDetails?.availabilityDate}>
                <Field.Label>Fecha de Disponibilidad</Field.Label>
                <Input
                  {...register("checkDetails.availabilityDate")}
                  type="date"
                  disabled={isPending}
                />
                <Field.ErrorText>
                  {errors.checkDetails?.availabilityDate?.message}
                </Field.ErrorText>
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root invalid={!!errors.checkDetails?.issuingBank}>
                <Field.Label>Entidad Emisora</Field.Label>
                <Input
                  {...register("checkDetails.issuingBank")}
                  disabled={isPending || currentMovementType === 1}
                />
                <Field.ErrorText>
                  {errors.checkDetails?.issuingBank?.message}
                </Field.ErrorText>
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root invalid={!!errors.checkDetails?.receiver}>
                <Field.Label>Receptor</Field.Label>
                <Input
                  {...register("checkDetails.receiver")}
                  disabled={isPending || currentMovementType === 2}
                />
                <Field.ErrorText>
                  {errors.checkDetails?.receiver?.message}
                </Field.ErrorText>
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root>
                <Field.Label>Cuenta</Field.Label>
                <Input
                  value={
                    accountsData?.accounts?.find(
                      (a: AccountResponseDto) => a.id === watch("accountId"),
                    )?.name ?? ""
                  }
                  disabled
                />
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root>
                <Field.Label>Monto</Field.Label>
                <Controller
                  name="checkDetails.amount"
                  control={control}
                  defaultValue={0}
                  render={() => (
                    <NumberInput.Root
                      value={String(watch("amount") ?? 0)}
                      formatOptions={{ style: "decimal" }}
                      locale="es-PY"
                      disabled
                    >
                      <InputGroup startElement="Gs.">
                        <NumberInput.Input />
                      </InputGroup>
                    </NumberInput.Root>
                  )}
                />
              </Field.Root>
            </GridItem>
          </Grid>
        )}

        {isPending && (
          <Text color="gray.500" fontSize="sm">
            Creando movimiento bancario...
          </Text>
        )}

        <Grid templateColumns="1fr 1fr" gap={4}>
          <Button
            variant="outline"
            alignSelf="start"
            onClick={() => navigate("/tesoreria/movimientos")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colorPalette="brand"
            loading={isPending}
            alignSelf="start"
          >
            <LuSave /> Crear movimiento
          </Button>
        </Grid>
      </Stack>
    </Stack>
  );
}
