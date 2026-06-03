import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Stack, Text, Icon, Collapsible } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { NAV_CONFIG, type NavItem } from "@/constants/navigation";
import LogoERP from "@/assets/LogoERP";
import { useAuthStore } from "@/stores/auth.store";

const SIDEBAR_W = "220px";
const SIDEBAR_COL = "48px";

interface Props {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(["ventas"]),
  );

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const isActive = (path?: string) => !!path && location.pathname === path;
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.path) ?? false;

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (user?.roleName.toLowerCase() === "admin") return true;
    return user?.permissions?.includes(permission) ?? false;
  };

  const isItemVisible = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => hasPermission(child.permission));
    }
    return hasPermission(item.permission);
  };

  const getItemSection = (item: NavItem) => {
    if (["ventas", "compras", "tesoreria", "contabilidad"].includes(item.id)) return "Operaciones";
    if (["gestiones", "configuraciones"].includes(item.id)) return "Administración";
    return undefined;
  };

  const visibleItems = NAV_CONFIG.filter(isItemVisible);
  let currentSection: string | undefined = undefined;

  return (
    <Box
      as="aside"
      w={collapsed ? SIDEBAR_COL : SIDEBAR_W}
      minW={collapsed ? SIDEBAR_COL : SIDEBAR_W}
      h="100%"
      transition="width .22s cubic-bezier(.4,0,.2,1), min-width .22s"
      overflow="hidden"
      flexShrink={0}
      display="flex"
      flexDirection="column"
    >
      <Box
        h="52px"
        display="flex"
        alignItems="center"
        gap="10px"
        px="12px"
        borderBottom="0.5px solid rgba(255,255,255,.07)"
        flexShrink={0}
      >
        <Box
          w="28px"
          h="28px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <LogoERP />
        </Box>
        <Text
          fontSize="13px"
          fontWeight="700"
          whiteSpace="nowrap"
          opacity={collapsed ? 0 : 1}
          transition="opacity .15s"
        >
          Bigotires ERP
        </Text>
      </Box>

      <Stack
        as="nav"
        gap={0}
        flex={1}
        overflowY="auto"
        overflowX="hidden"
        py="8px"
        px="8px"
      >
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          const groupActive = isGroupActive(item);
          const isOpen = openGroups.has(item.id);

          const itemSection = getItemSection(item);
          const showSectionHeader = itemSection && itemSection !== currentSection;
          if (itemSection) {
            currentSection = itemSection;
          }

          return (
            <Box key={item.id}>
              {showSectionHeader && !collapsed && (
                <Text
                  px="12px"
                  pt="8px"
                  pb="4px"
                  fontSize="10px"
                  fontWeight="500"
                  color="#555"
                  textTransform="uppercase"
                  letterSpacing=".08em"
                  whiteSpace="nowrap"
                >
                  {itemSection}
                </Text>
              )}

              {/* Item row */}
              <Box
                display="flex"
                borderRadius="full"
                // marginInline="8px"
                alignItems="center"
                gap={collapsed ? "0" : "10px"}
                px="12px"
                h="36px"
                minW="39px"
                cursor="pointer"
                bg={active || groupActive ? "brand.primary" : "transparent"}
                color={active || groupActive ? "white" : "black"}
                _hover={{ bg: active ? "brand.primary" : "brand.primary/20" }}
                transition="background .15s, color .15s"
                whiteSpace="nowrap"
                position="relative"
                alignContent="center"
                justifyContent="center"
                title={collapsed ? item.label : undefined}
                onClick={() =>
                  item.children
                    ? toggleGroup(item.id)
                    : item.path && navigate(item.path)
                }
              >
                <Icon
                  as={item.icon}
                  boxSize="15px"
                  flexShrink={0}
                  color={active || groupActive ? "white" : "#000"}
                />
                <Text
                  fontSize="13px"
                  flex={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  opacity={collapsed ? 0 : 1}
                  transition="opacity .15s"
                >
                  {item.label}
                </Text>
                {item.children && !collapsed && (
                  <Icon
                    as={ChevronRight}
                    boxSize="10px"
                    color="#666"
                    transform={isOpen ? "rotate(90deg)" : "none"}
                    transition="transform .2s"
                  />
                )}
              </Box>

              {item.children && !collapsed && (
                <Collapsible.Root open={isOpen}>
                  <Collapsible.Content>
                    {item.children
                      .filter((child) => hasPermission(child.permission))
                      .map((child) => (
                        <Box
                          key={child.id}
                          display="flex"
                          alignItems="center"
                          gap="10px"
                          pl="36px"
                          pr="12px"
                          h="32px"
                          cursor="pointer"
                          color={
                            isActive(child.path) ? "brand.secondary" : "#000"
                          }
                          _hover={{
                            bg: "rgba(255,255,255,.07)",
                            color: "brand.secondary",
                          }}
                          fontSize="12px"
                          transition="background .15s, color .15s"
                          onClick={() => child.path && navigate(child.path)}
                        >
                          <Icon as={child.icon} boxSize="13px" />
                          <Text>{child.label}</Text>
                        </Box>
                      ))}
                  </Collapsible.Content>
                </Collapsible.Root>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
