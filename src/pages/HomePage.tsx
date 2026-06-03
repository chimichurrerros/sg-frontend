import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { useMe } from "@/queries/auth.queries";
import {
  useAllProducts,
  useAllServices,
} from "@/queries/catalog.queries";
import { useGetAllCustomers } from "@/queries/customers.queries";
import { useGetAllSales } from "@/queries/sales.queries";
import { useAllStock } from "@/queries/stock.queries";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import { Box, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import {
  ClipboardList,
  Layers,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

export const HomePage = () => {
  const { data: user, isLoading: userLoading } = useMe();

  const { data: productsData, isLoading: productsLoading } = useAllProducts();
  const { data: servicesData, isLoading: servicesLoading } = useAllServices();
  const { data: customersData, isLoading: customersLoading } = useGetAllCustomers();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: salesData, isLoading: salesLoading } = useGetAllSales();
  const { data: stockData, isLoading: stockLoading } = useAllStock();

  if (userLoading) {
    return <LoadingScreen message="Cargando..." height="full" />;
  }

  const productCount = productsData?.products?.length ?? 0;
  const serviceCount = servicesData?.services?.length ?? 0;
  const customerCount = customersData?.length ?? 0;
  const supplierCount = suppliersData?.suppliers?.length ?? 0;
  const saleCount = salesData?.salesOrders.length ?? 0;
  const stockCount = stockData?.stocks?.length ?? 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Buenos días"
      : hour < 18
        ? "Buenas tardes"
        : "Buenas noches";

  const dateStr = now.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Stack gap={6} paddingInline="5%">
      <Box>
        <Heading size="xl" textTransform="capitalize">
          {greeting}, {user?.name} {user?.lastName}
        </Heading>
        <Text color="gray.500" fontSize="sm">
          {dateStr}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        <StatCard
          icon={Package}
          label="Productos"
          value={productCount}
          isLoading={productsLoading}
          color="blue.500"
        />
        <StatCard
          icon={ClipboardList}
          label="Servicios"
          value={serviceCount}
          isLoading={servicesLoading}
          color="teal.500"
        />
        <StatCard
          icon={Users}
          label="Clientes"
          value={customerCount}
          isLoading={customersLoading}
          color="green.500"
        />
        <StatCard
          icon={Truck}
          label="Proveedores"
          value={supplierCount}
          isLoading={suppliersLoading}
          color="orange.500"
        />
        <StatCard
          icon={ShoppingCart}
          label="Ventas"
          value={saleCount}
          isLoading={salesLoading}
          color="purple.500"
        />
        <StatCard
          icon={Layers}
          label="Stock (items)"
          value={stockCount}
          isLoading={stockLoading}
          color="cyan.500"
        />
      </SimpleGrid>

      <QuickActions />
    </Stack>
  );
};
