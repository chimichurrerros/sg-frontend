import type { UserDto } from "@/api/users.api.ts";
import { PasswordInput } from "@/components/ui/password-input";
import TableSelect, { type label } from "@/components/ui/table-select";

import { toaster } from "@/components/ui/toaster";
import { useRegister } from "@/queries/auth.queries";
import { useAllUsers } from "@/queries/users.queries";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth.store";
import {
  Button,
  ButtonGroup,
  CloseButton,
  createListCollection,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  type ListCollection,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Search, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuChevronLeft, LuChevronRight, LuMail } from "react-icons/lu";
import { Navigate } from "react-router-dom";

export const RegisterPage = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [authError, setAuthError] = useState<string | null>(null);
  const roles: ListCollection = createListCollection({
    items: [
      { label: "Usuario", value: "user", selected: true },
      { label: "Administrador", value: "admin" },
    ],
  });
  const queryClient = useQueryClient();
  // Register new user
  const { mutate: registerUser, isPending } = useRegister();
  // Search users
  const [searchRole, setSearchRole] = useState<string[]>([]);
  const [searchEmail, setSearchEmail] = useState<string>("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const endElement = searchEmail ? (
    <CloseButton
      size="xs"
      onClick={() => {
        setSearchEmail("");
        searchRef.current?.focus();
      }}
      me="-2"
    />
  ) : undefined;
  // Select user from the table
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  useEffect(() => {
    const handler = () => setSelectedUser(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [selectedUser]);
  // List all users
  const { data, isLoading: usersLoading, error: usersError } = useAllUsers(); // TODO: implement pagination
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { rol: "user" },
  });

  // Double-check even if the link is hidden
  if (!isAdmin) return <Navigate to="/dash" replace />;

  const onSubmit = (data: RegisterFormData) => {
    setAuthError(null);

    registerUser(data, {
      onSuccess: () => {
        reset();
        toaster.create({ title: "Usuario creado con éxito" });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (e) => {
        setAuthError("Ha ocurrido un error: " + e);
      },
    });
  };

  const onSelectUser = (user: UserDto | null) => {
    setSelectedUser(user);
  };

  if (usersError) {
    console.log("Ha ocurrido un error al cargar los usuarios: " + usersError);
  }

  const usersLabels: label<UserDto>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Correo", propName: "email" },
    { labelName: "Rol", propName: "roleName" },
    { labelName: "Estado", propName: "isActive" },
  ];

  const users = data
    ? data.users
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .filter((u) =>
          searchEmail !== "" ? u.email.includes(searchEmail) : true,
        )
        .filter((u) =>
          searchRole.length > 0
            ? searchRole.includes(u.roleName.toLowerCase())
            : true,
        )
    : [];

  return (
    <Stack padding={"1rem 3.75rem"}>
      {/* ===== Register new user form ===== */}
      <SimpleGrid
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        columns={2}
        gap={"1rem 2.5rem"}
      >
        <Heading size="2xl">Registrar Usuario Nuevo</Heading>
        <VStack justifySelf={"end"} alignItems={"end"} gap={2}>
          <Button
            type="submit"
            size="md"
            bgColor="brand.primary"
            loading={isPending}
          >
            <UserPlus /> Registrar usuario nuevo
          </Button>

          {authError && (
            <Text color="red.500" fontSize="xs" textAlign="center">
              {authError}
            </Text>
          )}
        </VStack>

        <Field.Root invalid={!!errors.name} required>
          <Field.Label>Nombre</Field.Label>
          <Input {...register("name")} placeholder="Josue" />
          <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.lastName}>
          <Field.Label>Apellido</Field.Label>
          <Input {...register("lastName")} placeholder="Vera" />
          <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.email} required>
          <Field.Label>Correo electrónico</Field.Label>
          <InputGroup startElement={<LuMail />}>
            <Input
              {...register("email")}
              placeholder="correo@bigotires.com.py"
            />
          </InputGroup>
          <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.password}>
          <Field.Label>Contraseña</Field.Label>
          <PasswordInput {...register("password")} />
          <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.confirmPassword}>
          <Field.Label>Repetir contraseña</Field.Label>
          <PasswordInput {...register("confirmPassword")} />
          <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.rol}>
          <Field.Label>Rol</Field.Label>
          <Controller
            name="rol"
            control={control}
            render={({ field }) => (
              <Select.Root
                collection={roles}
                value={field.value ? [field.value] : []}
                onValueChange={(e) => field.onChange(e.value[0])}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Rol" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {roles.items.map((role) => (
                        <Select.Item item={role} key={role.value}>
                          {role.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            )}
          />
          <Field.ErrorText>{errors.rol?.message}</Field.ErrorText>
        </Field.Root>
      </SimpleGrid>

      {/* ===== Users list ===== */}
      <Stack>
        <Heading size="2xl">Lista de usuarios</Heading>
        <Flex gap="0.75rem">
          <Select.Root
            collection={roles}
            value={searchRole}
            onValueChange={(e) => setSearchRole(e.value)}
            width="30rem"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Rol" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.ClearTrigger />
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {roles.items.map((role) => (
                    <Select.Item item={role} key={role.value}>
                      {role.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          <InputGroup startElement={<LuMail />} endElement={endElement}>
            <Input
              ref={searchRef}
              placeholder="Email"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.currentTarget.value);
              }}
            />
          </InputGroup>
          <Button bg="bg.subtle" variant="outline">
            <Search />
            Buscar
          </Button>
          <Button
            color="brand.primary"
            borderColor="brand.primary"
            variant="outline"
            disabled={selectedUser === null}
          >
            <RefreshCcw />
            Resetear contraseña
          </Button>
          <Button
            color="brand.primary"
            borderColor="brand.primary"
            variant="outline"
            disabled={selectedUser === null}
          >
            <Search />
            Activar / Desactivar
          </Button>
        </Flex>

        {/* <Table.Column htmlWidth="20%" />
        <Table.Column htmlWidth="30%" />
        <Table.Column htmlWidth="30%" />
        <Table.Column htmlWidth="20%" /> */}

        <Stack>
          <TableSelect
            labels={usersLabels}
            data={users}
            loading={usersLoading}
            onSelect={onSelectUser}
          ></TableSelect>

          <Pagination.Root
            count={users.length ?? 0}
            pageSize={pageSize}
            page={page}
            onPageChange={(e) => setPage(e.page)}
            display="flex"
            justifyContent="center"
          >
            <ButtonGroup attached variant="outline" size="sm">
              <Pagination.PrevTrigger asChild>
                <IconButton>
                  <LuChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={{ base: "outline", _selected: "solid" }}
                    zIndex={{ _selected: "1" }}
                    _selected={{ bg: "brand.primary", color: "white" }}
                  >
                    {page.value}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton>
                  <LuChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </Stack>
      </Stack>
    </Stack>
  );
};
