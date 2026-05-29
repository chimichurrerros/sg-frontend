import { Box } from "@chakra-ui/react";
import { IconButton, Text } from "@chakra-ui/react";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { billStatusEnumParse, billTypeEnumParse } from "@/types/bills";
import TableSelect, { type label } from "@/components/ui/table-select";
import { useAllBills } from "@/queries/bills.queries";
import { parseDate } from "@/constants/date";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import PaginationControl from "@/components/ui/pagination-control";
import type { PaginationParams } from "@/types/types";
import PageSizeControl from "@/components/ui/page-size-control";
import type { Bill } from "@/api/sales.api";

export default function BillsListPage() {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [params, setParams] = useState<PaginationParams>({ pageSize: 10, page: 1 });
  const {
    data: allBills,
    isPending: loadingAllBills,
    isError: isErrorAllBills,
    error: errorAllBills,
  } = useAllBills(params || undefined);

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
    {
      labelName: "Fecha",
      propName: "date",
      transformFunction: (value: string) => parseDate(value),
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      labelName: "Vencimiento",
      propName: "dueDate",
      transformFunction: (value: string) => parseDate(value),
      isSortable: true,
      sortFunction: (a: Bill, b: Bill) => new Date(a.dueDate ?? "").getTime() - new Date(b.dueDate ?? "").getTime(),
    },
    { labelName: "Total", propName: "total", transformFunction: (value) => parsePrice(value) },
    { labelName: "IVA", propName: "taxTotal", transformFunction: (value) => parsePrice(value) },
    { labelName: "Tipo", propName: "billType", transformFunction: (value) => billTypeEnumParse[Number(value)] },
    { labelName: "Estado", propName: "billState", transformFunction: (value) => billStatusEnumParse[Number(value)] },
  ];

  // const handleNewBill = () => {
  //   navigate("/ventas/facturas/nueva");
  // };

  const handleViewBill = () => {
    if (!selectedBill) return;
    navigate(`/ventas/facturas/${selectedBill.id}`);
  };

  return (
    <Box padding={5} display="flex" flexDirection="column" gap={4}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
        <Text fontWeight="bold" fontSize="3xl">
          Listado de Facturas
        </Text>

        <Box display="flex" flexDirection="row" alignItems="center" gap={3}>
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
            Registros por pág.
          </Text>
          <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />

          <IconButton
            paddingX={5}
            bgColor="brand.secondary"
            disabled={!selectedBill}
            onClick={handleViewBill}
          >
            <Eye size={20} />
            Ver
          </IconButton>
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
      <PaginationControl pagination={allBills?.pagination || null} onPageChange={(page) => setParams({ ...params, page })} />
    </Box>
  );
}
