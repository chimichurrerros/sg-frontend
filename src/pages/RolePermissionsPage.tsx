import { Button, ButtonGroup, Box, Flex, Heading, HStack, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useRoleDetails, useSyncRolePermissions } from "@/queries/roles.queries";
import { PERMISSION_GROUPS } from "@/constants/permissions";
import { toaster } from "@/components/ui/toaster";

export const RolePermissionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const roleId = Number(id);

  // Queries & Mutations
  const { data: roleData, isLoading } = useRoleDetails(roleId);
  const syncRolePermissions = useSyncRolePermissions();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Synchronize initial permissions
  useEffect(() => {
    if (roleData?.role) {
      setSelectedPermissions(roleData.role.permissions || []);
    }
  }, [roleData]);

  const handleTogglePermission = (name: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    if (!roleId) return;

    syncRolePermissions.mutate(
      {
        id: roleId,
        data: { permissions: selectedPermissions },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["roles"] });
          navigate("/register");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Box p={6} textAlign="center">
        <Text fontSize="lg" fontWeight="medium">
          Cargando permisos del rol...
        </Text>
      </Box>
    );
  }

  const roleName = roleData?.role?.name || "";

  return (
    <Stack gap={6} paddingInline="10%" py={6}>
      <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={4}>
        <VStack align="start" gap={1}>
          <Heading size="xl" color="brand.primary">
            Permisos del Rol: {roleName}
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Configura y asigna los accesos específicos para este rol de usuario.
          </Text>
        </VStack>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/register")}
        >
          <LuArrowLeft /> Volver a la lista
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
        {PERMISSION_GROUPS.map((group, index) => {
          const groupPerms = group.permissions.map((p) => p.name);

          return (
            <Box
              key={index}
              p={5}
              bg="white"
              borderWidth="1px"
              borderRadius="lg"
              borderColor="gray.200"
              shadow="xs"
            >
              <HStack justify="space-between" mb={3} borderBottomWidth="1px" pb={2} borderColor="gray.100">
                <Text fontWeight="bold" fontSize="md" color="brand.primary">
                  {group.title}
                </Text>
                <HStack gap={1}>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setSelectedPermissions((prev) =>
                        Array.from(new Set([...prev, ...groupPerms]))
                      );
                    }}
                    color="gray.600"
                  >
                    Todos
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setSelectedPermissions((prev) =>
                        prev.filter((p) => !groupPerms.includes(p))
                      );
                    }}
                    color="gray.600"
                  >
                    Ninguno
                  </Button>
                </HStack>
              </HStack>

              <VStack gap={2.5} align="stretch" maxH="250px" overflowY="auto" pr={1}>
                {group.permissions.map((permission) => (
                  <Checkbox.Root
                    key={permission.name}
                    checked={selectedPermissions.includes(permission.name)}
                    onCheckedChange={() => handleTogglePermission(permission.name)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontSize="sm" fontWeight="medium" cursor="pointer" userSelect="none">
                      {permission.label}
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>

      <ButtonGroup alignSelf="end" mt={4}>
        <Button
          variant="outline"
          onClick={() => navigate("/register")}
          disabled={syncRolePermissions.isPending}
        >
          Cancelar
        </Button>
        <Button
          bgColor="brand.primary"
          onClick={handleSave}
          loading={syncRolePermissions.isPending}
        >
          <LuSave /> Guardar Cambios
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
