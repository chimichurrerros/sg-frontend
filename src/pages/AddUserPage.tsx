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
  Checkbox,
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
import { useEffect, useState, useMemo } from "react";
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
    .min(0, "Seleccione un rol válido"),
  branchId: z
    .number({ message: "La sucursal es requerida" })
    .min(1, "Seleccione una sucursal válida"),
  isActive: z.boolean().optional(),
});

interface UserFormInput {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  roleId?: number;
  branchId?: number;
  isActive?: boolean;
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

  const branchCollection = useMemo(() => createListCollection({
    items: (branchesData?.branches ?? []).map((b) => ({
      label: b.name,
      value: String(b.id),
    })),
  }), [branchesData]);

  const roleCollection = useMemo(() => createListCollection({
    items: (rolesData?.roles ?? []).map((r) => ({
      label: r.name,
      value: String(r.id),
    })),
  }), [rolesData]);

  const schema = isEditMode ? editUserSchema : registerSchema;

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: undefined,
      branchId: undefined,
      isActive: true,
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
        isActive: u.isActive ?? false,
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
            branchId: formData.branchId!,
            roleId: formData.roleId!,
            isActive: formData.isActive,
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
        branchId: formData.branchId!,
        roleId: formData.roleId!,
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
        <Grid templateColumns="repeat(2, 1fr)" gap={4} alignItems="center" w="full">
          <GridItem colSpan={1} w="full">
            <Field.Root invalid={!!errors.name} required w="full">
              <Field.Label>Nombre</Field.Label>
              <Input
                {...register("name")}
                placeholder="Nombre"
                disabled={isPending}
                w="full"
              />
              <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={1} w="full">
            <Field.Root invalid={!!errors.lastName} required w="full">
              <Field.Label>Apellido</Field.Label>
              <Input
                {...register("lastName")}
                placeholder="Apellido"
                disabled={isPending}
                w="full"
              />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          <GridItem colSpan={2} w="full">
            <Field.Root invalid={!!errors.email} required w="full">
              <Field.Label>Correo electrónico</Field.Label>
              <Input
                {...register("email")}
                placeholder="correo@bigotires.com.py"
                type="email"
                disabled={isPending}
                w="full"
              />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>
          </GridItem>

          {!isEditMode && (
            <>
              <GridItem colSpan={1} w="full">
                <Field.Root invalid={!!errors.password} required w="full">
                  <Field.Label>Contraseña</Field.Label>
                  <PasswordInput
                    {...register("password")}
                    disabled={isPending}
                    w="full"
                    rootProps={{ w: "full" }}
                  />
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem colSpan={1} w="full">
                <Field.Root invalid={!!errors.confirmPassword} required w="full">
                  <Field.Label>Repetir contraseña</Field.Label>
                  <PasswordInput
                    {...register("confirmPassword")}
                    disabled={isPending}
                    w="full"
                    rootProps={{ w: "full" }}
                  />
                  <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
                </Field.Root>
              </GridItem>
            </>
          )}

          <GridItem colSpan={1} w="full">
            <Field.Root invalid={!!errors.roleId} required w="full">
              <Field.Label>Rol asignado</Field.Label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={roleCollection}
                    value={field.value !== undefined && field.value !== null ? [String(field.value)] : []}
                    onValueChange={(e) => field.onChange(e.value.length > 0 ? Number(e.value[0]) : null)}
                    disabled={isPending}
                    w="full"
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

          <GridItem colSpan={1} w="full">
            <Field.Root invalid={!!errors.branchId} required w="full">
              <Field.Label>Sucursal asignada</Field.Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    collection={branchCollection}
                    value={field.value !== undefined && field.value !== null ? [String(field.value)] : []}
                    onValueChange={(e) => field.onChange(e.value.length > 0 ? Number(e.value[0]) : null)}
                    disabled={isPending}
                    w="full"
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

          {isEditMode && (
            <GridItem colSpan={2} w="full">
              <Field.Root w="full">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox.Root
                      checked={field.value}
                      onCheckedChange={(e) => field.onChange(e.checked)}
                      disabled={isPending}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label fontSize="sm" fontWeight="medium">Usuario activo</Checkbox.Label>
                    </Checkbox.Root>
                  )}
                />
              </Field.Root>
            </GridItem>
          )}
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
