import { useNavigate, useLocation } from "react-router-dom";
import { Box, Text, Menu, Avatar, Icon } from "@chakra-ui/react";
import { AlignLeft, LogOut, User, Settings, PanelLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout }    from "@/queries/auth.queries";
import { NAV_CONFIG }   from "@/constants/navigation";

interface Props { onToggle: () => void; }

function useBreadcrumb() {
  const { pathname } = useLocation();
  for (const item of NAV_CONFIG) {
    if (item.path === pathname) return item.label;
    const child = item.children?.find(c => c.path === pathname);
    if (child) return `${item.label} / ${child.label}`;
  }
  return "";
}

export const TopBar = ({ onToggle }: Props) => {
  const user             = useAuthStore(s => s.user);
  const { mutate: logout } = useLogout();
  const navigate         = useNavigate();
  const breadcrumb       = useBreadcrumb();

  return (
    <Box
      as="header" h="52px" bg="white"
      borderBottom="0.5px solid" borderColor="border.subtle"
      display="flex" alignItems="center" px="16px" gap="12px" flexShrink={0}
    >
      {/* Sidebar toggle */}
      <Box
        as="button" w="32px" h="32px" borderRadius="md"
        border="0.5px solid" borderColor="border.muted"
        display="flex" alignItems="center" justifyContent="center"
        cursor="pointer" color="fg.muted"
        _hover={{ bg: "bg.subtle" }} onClick={onToggle}
      >
        <Icon as={PanelLeft} boxSize="14px" />
      </Box>

      {/* Breadcrumb */}
      <Text fontSize="13px" color="fg.muted" flex={1}>
        {breadcrumb.includes("/")
          ? <>{breadcrumb.split(" / ")[0]} / <strong>{breadcrumb.split(" / ")[1]}</strong></>
          : <strong>{breadcrumb}</strong>
        }
      </Text>

      {/* User menu */}
      <Menu.Root>
        <Menu.Trigger asChild>
          <Box
            display="flex" alignItems="center" gap="8px" cursor="pointer"
            px="8px" py="4px" borderRadius="md" _hover={{ bg: "bg.subtle" }}
          >
            <Box textAlign="right">
              <Text fontSize="13px" fontWeight="500">{user?.name} {user?.lastName}</Text>
              <Text fontSize="11px" color="fg.muted" fontStyle="italic">{user?.roleName}</Text>
            </Box>
            <Avatar.Root size="sm" bg="#1a7a4a">
              <Avatar.Fallback color="white" fontSize="11px">
                {user?.name?.[0]}{user?.lastName?.[0]}
              </Avatar.Fallback>
            </Avatar.Root>
          </Box>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content minW="140px">
            <Menu.Item value="profile" onClick={() => navigate("/dash/profile")}>
              <Icon as={User} boxSize="13px" /> Perfil
            </Menu.Item>
            <Menu.Item value="settings" onClick={() => navigate("/dash/configuraciones")}>
              <Icon as={Settings} boxSize="13px" /> Ajustes
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value="logout" color="fg.error" onClick={() => logout()}>
              <Icon as={LogOut} boxSize="13px" /> Cerrar sesión
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </Box>
  );
};