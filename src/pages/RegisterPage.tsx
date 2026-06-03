import type { UserDto } from "@/api/users.api.ts";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import TableEditable from "@/components/ui/table-edit";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import {
  useAllUsers,
  useToggleUserActiveStatus,
} from "@/queries/users.queries";
import {
  useAllRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/queries/roles.queries";
import { useAuthStore } from "@/stores/auth.store";
import {
  Box,
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
  Stack,
  Text,
  VStack,
  HStack,
  Tabs,
  Spacer,
  SimpleGrid,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Power,
  Pencil,
  Trash2,
  Save,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuMail, LuSearch, LuX } from "react-icons/lu";
import { Navigate, useNavigate } from "react-router-dom";

export const RegisterPage = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const navigate = useNavigate();

  // Dynamic Roles
  const { data: rolesData, isLoading: loadingRoles } = useAllRoles();
  const dbRoles = rolesData?.roles ?? [];
  const roleCollection = createListCollection({
    items: dbRoles.map((r) => ({ label: r.name, value: String(r.id) })),
  });

  // Mutations
  const { mutate: toggleActive, isPending: isToggling } =
    useToggleUserActiveStatus();

  // Role Mutations
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  // Mode and toggles for Roles Form (inline smaller entity pattern)
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);

  // Selected entities
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [roleFormName, setRoleFormName] = useState("");

  // Search users
  const [searchRoleName, setSearchRoleName] = useState<string[]>([]);
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

  // List all users
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersIsError,
    error: usersError,
  } = useAllUsers();

  // Pagination for users table
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Toggling Role Form
  const toggleRoleForm = () => {
    if (isRoleFormOpen) {
      handleCancelRoleForm();
    } else {
      setIsRoleFormOpen(true);
      setRoleFormName("");
    }
  };

  const handleCancelRoleForm = () => {
    setRoleFormName("");
    setIsRoleFormOpen(false);
  };

  const handleSubmitRole = async () => {
    if (!roleFormName.trim()) {
      toaster.create({ title: "El nombre del rol es obligatorio", type: "error" });
      return;
    }

    try {
      await createRole.mutateAsync({ name: roleFormName });
      handleCancelRoleForm();
    } catch (e) {
      // Errors are handled in the hooks
    }
  };

  const handleRoleDataChange = async (newData: any[]) => {
    const changedRole = newData.find((newRole) => {
      const originalRole = dbRoles.find((r) => r.id === newRole.id);
      return originalRole && originalRole.name !== newRole.name;
    });

    if (changedRole) {
      try {
        await updateRole.mutateAsync({
          id: changedRole.id,
          data: { name: changedRole.name },
        });
        toaster.create({ title: "Nombre del rol actualizado con éxito", type: "success" });
      } catch (e) {
        // Errors are handled in the hooks
      }
    }
  };



  // Toast notifications for user fetch error
  useEffect(() => {
    if (usersIsError) {
      toaster.create({
        title: "Ocurrió un error al cargar usuarios",
        description: usersError?.message || "Error desconocido",
        type: "error",
      });
    }
  }, [usersError, usersIsError]);

  if (!isAdmin) return <Navigate to="/dash" replace />;

  const usersLabels: label<UserDto>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Nombre", propName: "name" },
    { labelName: "Apellido", propName: "lastName" },
    { labelName: "Correo", propName: "email" },
    { labelName: "Sucursal", propName: "branchName" },
    { labelName: "Rol", propName: "roleName" },
    {
      labelName: "Estado",
      propName: "isActive",
      transformFunction: (isActive: boolean) =>
        isActive ? "Activo" : "Inactivo",
    },
  ];

  // Filtered users
  const rawUsers = usersData?.users ?? [];
  const filteredUsers = rawUsers
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .filter((u) => (searchEmail !== "" ? u.email.toLowerCase().includes(searchEmail.toLowerCase()) : true))
    .filter((u) =>
      searchRoleName.length > 0 ? searchRoleName.includes(String(u.roleId)) : true
    );

  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Tabs.Root defaultValue="users" lazyMount>
      <Tabs.List>
        <Tabs.Trigger value="users">
          <Users size={18} style={{ marginRight: 8 }} />
          Usuarios
        </Tabs.Trigger>
        <Tabs.Trigger value="roles">
          <ShieldCheck size={18} style={{ marginRight: 8 }} />
          Roles
        </Tabs.Trigger>
      </Tabs.List>

        {/* ==================== TAB 1: USERS ==================== */}
        <Tabs.Content value="users" pt={6}>
          <Stack gap={4}>
            {/* Custom Table Action Bar (based on TableBar styling but tailored with dynamic filters) */}
            <Flex gap="0.8rem" wrap="wrap" alignItems="center">
              <InputGroup startElement={<LuSearch />} maxW="32rem">
                <Input
                  ref={searchRef}
                  placeholder="Buscar"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.currentTarget.value)}
                  variant="subtle"
                />
              </InputGroup>

              <Select.Root
                collection={roleCollection}
                value={searchRoleName}
                onValueChange={(e) => setSearchRoleName(e.value)}
                width="15rem"
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger bg="white">
                    <Select.ValueText placeholder="Filtrar por Rol" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.ClearTrigger />
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {dbRoles.map((role) => (
                        <Select.Item item={{ label: role.name, value: String(role.id) }} key={role.id}>
                          {role.name}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              <Spacer />

              <ConfirmActionDialog
                title={selectedUser?.isActive ? "Desactivar usuario" : "Activar usuario"}
                description={
                  selectedUser?.isActive
                    ? `¿Estás seguro de que deseas desactivar al usuario ${selectedUser?.email}?`
                    : `¿Estás seguro de que deseas activar al usuario ${selectedUser?.email}?`
                }
                acceptText="Confirmar"
                onAccept={() => selectedUser && toggleActive(selectedUser.id)}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="brand"
                    disabled={selectedUser === null || isToggling}
                  >
                    <Power size={16} />
                    {selectedUser?.isActive ? "Desactivar" : "Activar"}
                  </Button>
                }
              />

              <Button
                size="sm"
                variant="outline"
                colorPalette="brand"
                disabled={selectedUser === null}
                onClick={() => selectedUser && navigate(`/register/${selectedUser.id}`)}
              >
                <Pencil size={16} />
                Editar
              </Button>

              <Button
                size="sm"
                colorPalette="brand"
                onClick={() => navigate("/register/nuevo")}
              >
                <Plus size={16} /> Nuevo
              </Button>
            </Flex>

            <TableSelect
              labels={usersLabels}
              data={paginatedUsers}
              loading={usersLoading}
              onSelect={(u) => setSelectedUser(u)}
              onDoubleClick={(u) => navigate(`/register/${u.id}`)}
              noItemsComponent={
                <EmptyDataScreen
                  title="No se encontraron usuarios"
                  message="Ajusta los filtros de búsqueda o registra un nuevo usuario."
                />
              }
            />

            <Pagination.Root
              count={filteredUsers.length}
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
        </Tabs.Content>

        {/* ==================== TAB 2: ROLES ==================== */}
        <Tabs.Content value="roles" pt={6}>
          <Stack gap={4}>
            {/* Roles Custom Table Action Bar */}
            <Flex gap="0.8rem" alignItems="center">
              <Spacer />

              <Button
                size="sm"
                colorPalette="brand"
                onClick={toggleRoleForm}
              >
                {isRoleFormOpen ? <LuX size={16} /> : <Plus size={16} />}
                {isRoleFormOpen ? "Cancelar" : "Nuevo"}
              </Button>
            </Flex>

            {/* Collapsible Role Form */}
            {isRoleFormOpen && (
              <Box
                borderWidth="1px"
                borderRadius="lg"
                p={6}
                bg="gray.50"
                shadow="sm"
                data-state="open"
                _open={{
                  animation: "fade-in 300ms ease-out",
                }}
              >
                <VStack gap={4} align="stretch">
                  <Heading size="md" borderBottomWidth="1px" pb={2}>
                    Crear Nuevo Rol de Acceso
                  </Heading>

                  <Field.Root required>
                    <Field.Label fontWeight="medium">Nombre del Rol</Field.Label>
                    <Input
                      placeholder="Ej. Auditor de Ventas"
                      value={roleFormName}
                      onChange={(e) => setRoleFormName(e.target.value)}
                      bg="white"
                    />
                  </Field.Root>

                  <HStack gap={3} justify="flex-end">
                    <Button onClick={handleCancelRoleForm} variant="outline" colorPalette="gray">
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitRole}
                      bgColor="brand.primary"
                      loading={createRole.isPending}
                    >
                      <Save size={18} />
                      Crear Rol
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            )}

            <TableEditable
              labels={[
                { labelName: "ID", propName: "id" as const, isEditable: false },
                {
                  labelName: "Nombre del Rol",
                  propName: "name" as const,
                  isEditable: true,
                  validate: (val: string) => !!val.trim(),
                },
                {
                  labelName: "Cantidad de Permisos",
                  isComponent: true,
                  render: (role) => (
                    <Text fontSize="sm">{role.permissions?.length ?? 0}</Text>
                  ),
                },
                {
                  labelName: "Acciones",
                  isComponent: true,
                  render: (role) => (
                    <DestructiveActionDialog
                      title="Eliminar Rol de Acceso"
                      description={`¿Estás seguro de que deseas eliminar el rol "${role.name}"? Esta acción no se puede deshacer y fallará si existen usuarios que pertenezcan a este rol.`}
                      onAccept={async () => {
                        try {
                          await deleteRole.mutateAsync(role.id);
                        } catch (e) {
                          // Handled in hooks
                        }
                      }}
                      trigger={
                        <IconButton
                          colorPalette="red"
                          variant="ghost"
                          size="sm"
                          aria-label="Eliminar rol"
                          disabled={deleteRole.isPending}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      }
                    />
                  ),
                },
              ]}
              data={dbRoles}
              loading={loadingRoles}
              onDataChange={handleRoleDataChange}
              onRowClick={(role) => navigate(`/register/roles/${role.id}/permisos`)}
              noItemsComponent={
                <EmptyDataScreen
                  title="No hay roles creados"
                  message="Crea un rol pulsando en 'Nuevo' para comenzar."
                />
              }
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
  );
};
