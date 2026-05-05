import { Box } from "@chakra-ui/react";
import { IconButton, Text } from "@chakra-ui/react";
import { Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Bill } from "@/types/bills";
import TableSelect, { type label } from "@/components/ui/table-select";
import { useAllBills } from "@/queries/bills.queries";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";

export default function BillsListPage() {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);

  const {
    data: allBills,
    isPending: loadingAllBills,
    isError: isErrorAllBills,
    error: errorAllBills,
  } = useAllBills();

  useEffect(() => {
    if (allBills?.bills) {
      setBills(allBills.bills);
    }
  }, [allBills]);

  useEffect(() => {
    if (isErrorAllBills) {
      toaster.create({
        title: "Error al traer las Facturas",
        description: errorAllBills?.message,
        type: "error",
      });
    }
  }, [isErrorAllBills, errorAllBills]);

  const labels: label<Bill>[] = [
    {
      labelName: "ID",
      propName: "id",
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) => a.id - b.id,
    },
    {
      labelName: "Número",
      propName: "number",
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) => a.number.localeCompare(b.number),
    },
    { labelName: "Fecha", propName: "date" },
    { labelName: "Vencimiento", propName: "dueDate" },
    { labelName: "Total", propName: "total" },
    { labelName: "IVA", propName: "taxTotal" },
    { labelName: "Tipo", propName: "billType" },
    { labelName: "Estado", propName: "billState" },
  ];

  const handleNewBill = () => {
    navigate("/ventas/facturas/nueva");
  };

  const handleViewBill = () => {
    if (!selectedBill) return;
    navigate(`/ventas/facturas/${selectedBill.id}`);
  };

  return (
    <Box padding={5} display="flex" flexDirection="column" gap={4}>
      <Box
        display="flex"
        flexDirection="row"
        gap={5}
        alignContent="center"
        justifyContent="space-between"
      >
        <Text fontWeight="bold" fontSize="3xl">
          Listado de Facturas
        </Text>
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <IconButton
            paddingX={5}
            bgColor="brand.secondary"
            disabled={!selectedBill}
            onClick={handleViewBill}
          >
            <Eye size={20} />
            Ver
          </IconButton>
          {/* <IconButton
            paddingX={5}
            bgColor="brand.primary"
            onClick={handleNewBill}
          >
            <Plus size={20} />
            Nueva
          </IconButton> */}
        </Box>
      </Box>

      <TableSelect
        key={JSON.stringify(bills)}
        data={bills}
        loading={loadingAllBills}
        labels={labels}
        loadingMessage="Cargando Facturas..."
        height="auto"
        noItemsComponent={
          <EmptyDataScreen
            title="No hay Facturas registradas"
            message="Registra nuevas Facturas para verlas en esta lista."
          />
        }
        onSelect={(item: Bill | null) => {
          setSelectedBill(item);
        }}
        onDoubleClick={(item: Bill) => navigate(`/ventas/facturas/${item.id}`)}
      />
    </Box>
  );
}
