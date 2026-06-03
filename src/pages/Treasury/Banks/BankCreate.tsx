import {
  createBankSchema,
  type CreateBankFormData,
} from "@/schemas/banks.schema";
import { useCreateBank } from "@/queries/banks.queries";
import { type CreateBankRequestDto } from "@/api/banks.api";
import { toaster } from "@/components/ui/toaster";
import {
  Button,
  Field,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/ui/title";

export default function BankCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createBank, isPending } = useCreateBank();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBankFormData>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: "",
      ruc: "",
    },
  });

  const handleCreate = (formData: CreateBankFormData) => {
    const apiData: CreateBankRequestDto = {
      name: formData.name || null,
      ruc: formData.ruc || null,
    };
    createBank(apiData, {
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
        <PageTitle>Nuevo Banco</PageTitle>
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
            <Field.Root invalid={!!errors.name}>
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

          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.ruc}>
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
