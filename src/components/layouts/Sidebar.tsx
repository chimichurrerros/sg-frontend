import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Stack, Text, Icon, Collapsible } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { NAV_CONFIG, type NavItem } from "@/constants/navigation";
import LogoERP from "@/assets/LogoERP";

const SIDEBAR_W = "220px";
const SIDEBAR_COL = "48px";

interface Props {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(["ventas", "rrhh", "gestiones"]),
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

  const isActive = (path?: string) => !!path && location.pathname === path.split("?")[0];

  const nodeHasActiveChild = (node: { path?: string; children?: { path?: string; children?: any[] }[] }) => {
    if (node.path && isActive(node.path)) {
      return true;
    }

    return node.children?.some((child) => nodeHasActiveChild(child)) ?? false;
  };

  const renderChild = (child: { id: string; label: string; icon: any; path?: string; children?: any[] }, depth = 0) => {
    const active = isActive(child.path);
    const childGroupActive = nodeHasActiveChild(child);
    const isOpen = openGroups.has(child.id);
    const hasChildren = !!child.children?.length;

    return (
      <Box key={child.id}>
        <Box
          display="flex"
          alignItems="center"
          gap="10px"
          pl={depth === 0 ? "36px" : "52px"}
          pr="12px"
          h="32px"
          cursor={hasChildren ? "pointer" : "pointer"}
          color={active || childGroupActive ? "brand.secondary" : "#000"}
          _hover={{
            bg: "rgba(255,255,255,.07)",
            color: "brand.secondary",
          }}
          fontSize="12px"
          transition="background .15s, color .15s"
          onClick={() =>
            hasChildren ? toggleGroup(child.id) : child.path && navigate(child.path)
          }
        >
          <Icon as={child.icon} boxSize="13px" />
          <Text flex={1}>{child.label}</Text>
          {hasChildren && (
            <Icon
              as={ChevronRight}
              boxSize="10px"
              color="#666"
              transform={isOpen ? "rotate(90deg)" : "none"}
              transition="transform .2s"
            />
          )}
        </Box>

        {hasChildren && (
          <Collapsible.Root open={isOpen}>
            <Collapsible.Content>
              {child.children?.map((nested) => renderChild(nested, depth + 1))}
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </Box>
    );
  };

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
        {NAV_CONFIG.map((item) => {
          const active = isActive(item.path);
          const groupActive = nodeHasActiveChild(item);
          const isOpen = openGroups.has(item.id);

          return (
            <Box key={item.id}>
              {item.section && !collapsed && (
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
                  {item.section}
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
                    {item.children.map((child) => renderChild(child))}
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
