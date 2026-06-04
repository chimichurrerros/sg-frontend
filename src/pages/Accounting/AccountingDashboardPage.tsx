import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, Grid, Button, Icon, Heading } from "@chakra-ui/react";
import { 
  Calendar, 
  BookOpen, 
  Scale, 
  TableProperties, 
  TrendingUp, 
  FilePlus 
} from "lucide-react";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
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
      navigate(`/contabilidad/libro-diario?process=${selectedPeriod}`);
    } else if (reportName === "Libro Mayor") {
      navigate(`/contabilidad/libro-mayor?process=${selectedPeriod}`);
    } else if (reportName === "Balance General") {
      navigate(`/contabilidad/balance-general?process=${selectedPeriod}`);
    } else if (reportName === "Balance de Sumas y Saldos") {
      navigate(`/contabilidad/balance-sumas-saldos?process=${selectedPeriod}`);
    } else if (reportName === "Balance de Resultados") {
      navigate(`/contabilidad/balance-resultados?process=${selectedPeriod}`);
    } else {
      console.log(`Ver reporte: ${reportName} para el periodo: ${selectedPeriod}`);
    }
  };

  return (
    <Box p={5} display="flex" flexDirection="column" gap={6}>
      {/* Título */}
      <Text fontWeight="bold" fontSize="3xl">
        Contabilidad
      </Text>

      {/* Acciones a la derecha */}
      <Flex justify="flex-end" align="center" gap={3} wrap="wrap">
        <SelectWrapper
          options={periodOptions}
          value={selectedPeriod}
          onValueChange={(val) => setSelectedPeriod(val)}
          width="200px"
        />
        <Button
          variant="outline"
          borderColor="brand.primary"
          color="brand.primary"
          _hover={{ bg: "brand.primary", color: "white" }}
          onClick={() => navigate("/contabilidad/plan-cuentas")}
        >
          Configurar Plan & Periodos
        </Button>
        <Button
          bgColor="brand.primary"
          color="white"
          _hover={{ bg: "brand.secondary" }}
          onClick={() => navigate("/contabilidad/nuevo-asiento")}
        >
          <Icon as={FilePlus} boxSize="16px" />
          Nuevo Asiento Manual
        </Button>
      </Flex>

      {/* Grid of Report Cards */}
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
        gap={6} 
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
    </Box>
  );
}
