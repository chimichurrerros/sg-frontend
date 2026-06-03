import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { useAllBranches } from "@/queries/branches.queries";
import { useAllRoles } from "@/queries/roles.queries";
import { useRegister } from "@/queries/auth.queries";
import { useUser, useUpdateUser } from "@/queries/users.queries";
import { registerSchema } from "@/schemas/auth.schema";
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
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuArrowLeft, LuMail, LuSave } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

// Separate schema for editing users (where password is not required)
const editUserSchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z
    .string({ message: "El apellido es requerido" })
    .min(1, "El apellido es requerido")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z
    .string({ message: "El correo electrónico es requerido" })
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  roleId: z
    .number({ message: "El rol es requerido" })
    .min(1, "Seleccione un rol válido"),
  branchId: z
    .number({ message: "La sucursal es requerida" })
    .min(1, "Seleccione una sucursal válida"),
});

interface UserFormInput {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  roleId: number;
  branchId: number;
}

export const AddUserPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const userId = id ? Number(id) : undefined;
  const isEditMode = Boolean(userId);

  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: userData } = useUser(userId);
  const { data: branchesData } = useAllBranches();
  const { data: rolesData } = useAllRoles();

  // Mutations
  const { mutate: registerUser, isPending: isRegisterPending } = useRegister();
  const { mutate: updateUser, isPending: isUpdatePending } = useUpdateUser();

  const isPending = isRegisterPending || isUpdatePending;

  const branchCollection = createListCollection({
    items: (branchesData?.branches ?? []).map((b) => ({
      label: b.name,
      value: String(b.id),
    })),
  });

  const roleCollection = createListCollection({
    items: (rolesData?.roles ?? []).map((r) => ({
      label: r.name,
      value: String(r.id),
    })),
  });

  const schema = isEditMode ? editUserSchema : registerSchema;

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: 0,
      branchId: 0,
    },
  });

  // Populate form if in edit mode and user data is fetched
  useEffect(() => {
    if (userData?.user) {
      const u = userData.user;
      reset({
        name: u.name ?? "",
        lastName: u.lastName ?? "",
        email: u.email ?? "",
        branchId: u.branchId ?? 0,
        roleId: u.roleId ?? 0,
      });
    }
  }, [userData, reset]);

  const handleSave = (formData: UserFormInput) => {
    setFormError(null);

    if (isEditMode && userId) {
      updateUser(
        {
          id: userId,
          data: {
            name: formData.name,
            lastName: formData.lastName,
            email: formData.email,
            branchId: formData.branchId,
            roleId: formData.roleId,
          },
        },
        {
          onSuccess: () => {
            toaster.create({ title: "Usuario actualizado con éxito", type: "success" });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            navigate("/register");
          },
          onError: (error: any) => {
            const errMsg = error.response?.data?.detail || error.response?.data?.title || error.message;
            setFormError("Ha ocurrido un error al actualizar: " + errMsg);
          },
        }
      );
      return;
    }

    registerUser(
      {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password!,
        branchId: formData.branchId,
        roleId: formData.roleId,
      },
      {
        onSuccess: () => {
          toaster.create({ title: "Usuario creado con éxito", type: "success" });
          queryClient.invalidateQueries({ queryKey: ["users"] });
          navigate("/register");
        },
        onError: (error: any) => {
          const errMsg = error.response?.data?.detail || error.response?.data?.title || error.message;
          setFormError("Ha ocurrido un error al registrar: " + errMsg);
        },
      }
    );
  };

  return (
    <Stack gap={4} paddingInline="15%" py={6}>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">
          {isEditMode ? "Editar usuario" : "Nuevo usuario"}
        </Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/register")}
        >
          <LuArrowLeft /> Volver a la lista
        </Button>
      </Flex>

      <Stack as="form" onSubmit={handleSubmit(handleSave)} gap={4}>
        <Grid templateColumns="2fr 2fr" gap={4} alignItems="center">
          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.name} required>
              <Field.Label>Nombre</Field.Label>
              <Input
                {...register("name")}
                placeholder="Nombre"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.lastName} required>
              <Field.Label>Apellido</Field.Label>
              <Input
                {...register("lastName")}
                placeholder="Apellido"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={4}>
            <Field.Root invalid={!!errors.email} required>
              <Field.Label>Correo electrónico</Field.Label>
              <Input
                {...register("email")}
                placeholder="correo@bigotires.com.py"
                type="email"
                disabled={isPending}
              />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          {!isEditMode && (
            <>
              <GridItem colSpan={2}>
                <Field.Root invalid={!!errors.password} required>
                  <Field.Label>Contraseña</Field.Label>
                  <PasswordInput {...register("password")} disabled={isPending} />
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem colSpan={2}>
                <Field.Root invalid={!!errors.confirmPassword} required>
                  <Field.Label>Repetir contraseña</Field.Label>
                  <PasswordInput {...register("confirmPassword")} disabled={isPending} />
                  <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
                </Field.Root>
              </GridItem>
            </>
          )}

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.roleId} required>
              <Field.Label>Rol asignado</Field.Label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={roleCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(e) => field.onChange(e.value[0] ? Number(e.value[0]) : null)}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar rol" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {roleCollection.items.map((item) => (
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
              <Field.ErrorText>{errors.roleId?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2}>
            <Field.Root invalid={!!errors.branchId} required>
              <Field.Label>Sucursal asignada</Field.Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={branchCollection}
                    value={field.value ? [String(field.value)] : []}
                    onValueChange={(e) => field.onChange(e.value[0] ? Number(e.value[0]) : null)}
                    disabled={isPending}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar sucursal" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {branchCollection.items.map((item) => (
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
              <Field.ErrorText>{errors.branchId?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>
        </Grid>

        {formError && (
          <Text color="red.500" fontSize="sm" fontWeight="medium">
            {formError}
          </Text>
        )}

        <ButtonGroup alignSelf="end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/register")}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" bgColor="brand.primary" loading={isPending}>
            <LuSave /> {isEditMode ? "Guardar cambios" : "Registrar usuario"}
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
};
