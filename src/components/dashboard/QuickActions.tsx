import { Box, Button, SimpleGrid, Text } from "@chakra-ui/react";
import {
  ClipboardList,
  FileText,
  Package,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "Nueva venta", icon: ShoppingCart, path: "/ventas/nueva" },
    {
      label: "Nuevo producto",
      icon: Package,
      path: "/catalogo/nuevo-producto",
    },
    {
      label: "Nuevo servicio",
      icon: FileText,
      path: "/catalogo/nuevo-servicio",
    },
    {
      label: "Nuevo proveedor",
      icon: UserPlus,
      path: "/proveedores/nuevo",
    },
    {
      label: "Pedido de compra",
      icon: ClipboardList,
      path: "/compras/pedidos/nuevo",
    },
  ];

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={3}>
        Accesos rápidos
      </Text>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={3}>
        {actions.map(({ label, icon: Icon, path }) => (
          <Button
            key={label}
            onClick={() => navigate(path)}
            variant="outline"
            size="lg"
            height="auto"
            py={4}
            justifyContent="flex-start"
            gap={3}
          >
            <Icon size={20} />
            {label}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};
