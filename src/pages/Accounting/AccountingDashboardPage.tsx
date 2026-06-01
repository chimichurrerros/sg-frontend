import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, Grid, Button, Icon, Heading } from "@chakra-ui/react";
import { 
  Calendar, 
  BookOpen, 
  Scale, 
  TableProperties, 
  TrendingUp, 
  FilePlus, 
  ChevronRight 
} from "lucide-react";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { useAllAccountantProcesses } from "@/queries/accountantProcesses.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onViewReport: () => void;
}

const ReportCard = ({ title, description, icon, onViewReport }: ReportCardProps) => {
  return (
    <Box
      bg="white"
      border="1.5px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={6}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minH="200px"
      shadow="sm"
      _hover={{ 
        shadow: "md", 
        borderColor: "brand.secondary",
        transform: "translateY(-2px)" 
      }}
      transition="all 0.2s ease-in-out"
    >
      <Flex gap={4} align="start">
        <Icon 
          as={icon} 
          boxSize="36px" 
          color="gray.700" 
          flexShrink={0} 
        />
        <Box>
          <Heading 
            fontSize="lg" 
            fontWeight="bold" 
            color="gray.800" 
            mb={2}
          >
            {title}
          </Heading>
          <Text 
            fontSize="sm" 
            color="gray.600" 
            lineHeight="tall"
          >
            {description}
          </Text>
        </Box>
      </Flex>
      
      <Button
        variant="outline"
        borderColor="brand.primary"
        color="brand.primary"
        size="md"
        w="100%"
        mt={6}
        fontWeight="medium"
        _hover={{ 
          bg: "brand.primary", 
          color: "white" 
        }}
        transition="all 0.15s ease"
        onClick={onViewReport}
      >
        Ver Reporte
      </Button>
    </Box>
  );
};

export default function AccountingDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAllAccountantProcesses();
  const [selectedPeriod, setSelectedPeriod] = useState("");

  useEffect(() => {
    if (data?.accountantProcesses && data.accountantProcesses.length > 0 && !selectedPeriod) {
      setSelectedPeriod(data.accountantProcesses[0].name);
    }
  }, [data, selectedPeriod]);

  // Update browser tab/document title when selectedPeriod changes, and restore on unmount
  useEffect(() => {
    const originalTitle = document.title;
    if (selectedPeriod) {
      document.title = `${selectedPeriod} - Dashboard Contabilidad`;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [selectedPeriod]);

  if (isLoading) {
    return <LoadingScreen message="Cargando procesos contables..." height="full" />;
  }

  if (isError) {
    return (
      <ErrorScreen 
        title="Error al cargar procesos contables" 
        errorMessage={error?.message || "Error desconocido"} 
        retry={refetch}
      />
    );
  }

  const periodOptions = data?.accountantProcesses.map((p) => ({
    label: p.name,
    value: p.name,
  })) || [];

  const handleViewReport = (reportName: string) => {
    if (reportName === "Libro Diario") {
      navigate(`/dash/contabilidad/libro-diario?process=${selectedPeriod}`);
    } else if (reportName === "Libro Mayor") {
      navigate(`/dash/contabilidad/libro-mayor?process=${selectedPeriod}`);
    } else if (reportName === "Balance General") {
      navigate(`/dash/contabilidad/balance-general?process=${selectedPeriod}`);
    } else if (reportName === "Balance de Sumas y Saldos") {
      navigate(`/dash/contabilidad/balance-sumas-saldos?process=${selectedPeriod}`);
    } else if (reportName === "Balance de Resultados") {
      navigate(`/dash/contabilidad/balance-resultados?process=${selectedPeriod}`);
    } else {
      console.log(`Ver reporte: ${reportName} para el periodo: ${selectedPeriod}`);
    }
  };

  return (
    <Box p={5} display="flex" flexDirection="column" gap={6}>
      {/* Top Header Row with Breadcrumb & Dropdown */}
      <Flex 
        justify="space-between" 
        align="center" 
        w="100%" 
        wrap="wrap" 
        gap={4}
      >
        {/* Breadcrumb */}
        <Flex align="center" gap={1.5} fontSize="13px" color="gray.600">
          <Text>Contabilidad</Text>
          <Icon as={ChevronRight} boxSize="12px" color="gray.400" />
          <Text fontWeight="semibold" color="gray.800">
            Panel Principal
          </Text>
        </Flex>

        {/* Period Selector */}
        {/* <SelectWrapper
          options={periodOptions}
          value={selectedPeriod}
          onValueChange={(val) => setSelectedPeriod(val)}
          width="150px"
        /> */}
      </Flex>

      {/* Grid of Report Cards */}
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
        gap={6} 
        mt={2}
      >
        <ReportCard
          title="Libro Diario"
          description="Registro cronológico detallado de todas las transacciones diarias."
          icon={Calendar}
          onViewReport={() => handleViewReport("Libro Diario")}
        />
        <ReportCard
          title="Libro Mayor"
          description="Historial de movimientos y saldo actual filtrado por cuenta."
          icon={BookOpen}
          onViewReport={() => handleViewReport("Libro Mayor")}
        />
        <ReportCard
          title="Balance General"
          description="Estado de situación financiera de la empresa (Activos y Pasivos)."
          icon={Scale}
          onViewReport={() => handleViewReport("Balance General")}
        />
        <ReportCard
          title="Balance de Sumas y Saldos"
          description="Resumen de saldos para control y comprobación contable."
          icon={TableProperties}
          onViewReport={() => handleViewReport("Balance de Sumas y Saldos")}
        />
        <ReportCard
          title="Balance de Resultados"
          description="Estado de rentabilidad: ingresos por ventas y servicios vs costos."
          icon={TrendingUp}
          onViewReport={() => handleViewReport("Balance de Resultados")}
        />
      </Grid>

      {/* Footer Link: Nuevo Asiento Manual */}
      <Flex mt={4}>
        <Flex 
          align="center" 
          gap={2} 
          cursor="pointer" 
          color="brand.primary" 
          fontWeight="semibold"
          fontSize="14px"
          _hover={{ color: "brand.secondary" }}
          transition="color 0.15s ease"
          onClick={() => console.log("Crear nuevo asiento manual")}
        >
          <Icon as={FilePlus} boxSize="16px" />
          <Text>Nuevo Asiento Manual</Text>
        </Flex>
      </Flex>
    </Box>
  );
}
