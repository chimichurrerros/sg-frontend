import { Box, Spinner } from "@chakra-ui/react";
import { Text, Button, HStack, Grid, GridItem, Checkbox } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BillDetail } from "@/types/bill-detail";
import { useBillById } from "@/queries/bills.queries";
import { useBillDetailsByBillId } from "@/queries/bill-details.queries";
import { useGetSaleById } from "@/queries/sales.queries";
import { useAllProducts } from "@/queries/catalog.queries";
import { parsePrice } from "@/constants/price";
import { parseDate } from "@/constants/date";
import type { PaginationType } from "@/types/types";
import TableEditable, { type EditableLabel } from "@/components/ui/tables/table-edit";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import PageTitle from "@/components/ui/title";

export default function BillFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const billId = id ? parseInt(id) : 0;

  const [number, setNumber] = useState("");
  const [date, setDate] = useState("");
  const [salesOrderId, setSalesOrderId] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerRuc, setCustomerRuc] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCredit, setIsCredit] = useState(false);

  const [details, setDetails] = useState<BillDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);

  const { data: billData, isPending: loadingBill } = useBillById(billId, billId > 0);
  const { data: billDetailsData, isPending: loadingDetails } =
    useBillDetailsByBillId(billId, { page: 1, pageSize: 100 });
  const { data: saleData } = useGetSaleById(salesOrderId > 0 ? salesOrderId : undefined);
  const { data: productsData } = useAllProducts();

  useEffect(() => {
    if (billData?.bill) {
      const bill = billData.bill;
      setNumber(bill.number);
      setDate(bill.date);
      setSalesOrderId(bill.salesOrderId ?? 0);
      setIsCredit(bill.isCredit);
    }
  }, [billData]);

  useEffect(() => {
    if (billDetailsData?.billDetails) {
      setDetails(billDetailsData.billDetails);
    }
    if (billDetailsData?.pagination) {
      setPagination(billDetailsData.pagination);
    }
  }, [billDetailsData]);

  useEffect(() => {
    if (saleData) {
      setCustomerName(saleData.customerName || "");
      setCustomerRuc(saleData.customerRuc || "");
      setCustomerEmail(saleData.customerEmail || "");
    }
  }, [saleData]);

  const getProductName = (productId: number) => {
    const product = productsData?.products.find((p) => p.id === productId);
    return product?.name ?? `Producto ${productId}`;
  };

  const getExentas = (d: BillDetail) => (d.taxRate === 0 ? d.price * d.quantity : 0);
  const getIva5 = (d: BillDetail) => (d.taxRate === 5 ? d.price * d.quantity : 0);
  const getIva10 = (d: BillDetail) => (d.taxRate === 10 ? d.price * d.quantity : 0);

  const showIfNotZero = (value: number) => (value > 0 ? parsePrice(value) : "-");

  const detailLabels: EditableLabel<BillDetail>[] = [
    { labelName: "Cód.", propName: "productId" },
    { labelName: "Cantidad", propName: "quantity" },
    {
      labelName: "Descripción",
      isComponent: true,
      render: (item) => getProductName(item.productId),
    },
    {
      labelName: "Precio Unit.",
      isComponent: true,
      render: (item) => parsePrice(item.price),
    },
    {
      labelName: "Exentas",
      isComponent: true,
      render: (item) => showIfNotZero(getExentas(item)),
    },
    {
      labelName: "5%",
      isComponent: true,
      render: (item) => showIfNotZero(getIva5(item)),
    },
    {
      labelName: "10%",
      isComponent: true,
      render: (item) => showIfNotZero(getIva10(item)),
    },
  ];

  const totalExentas = details.reduce((sum, d) => sum + getExentas(d), 0);
  const totalIva5 = details.reduce((sum, d) => sum + getIva5(d), 0);
  const totalIva10 = details.reduce((sum, d) => sum + getIva10(d), 0);
  const totalGeneral = details.reduce((sum, d) => sum + d.price * d.quantity, 0);

  const isLoading = loadingBill || loadingDetails;

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
        <LoadingScreen message="Cargando Factura..."/>
      </Box>
    );
  }

  return (
    <Box p={5} display="flex" flexDirection="column" gap={4}>
      <HStack justifyContent="space-between">
        <PageTitle>
          Factura {number}
        </PageTitle>
        <Button variant="outline" onClick={() => navigate("/ventas/facturas")}>
          <ArrowLeft size={18} /> Volver al listado
        </Button>
      </HStack>

      <Box borderWidth="1px" borderRadius="md" overflow="hidden">
        <Grid templateColumns="2fr 1fr">
          <GridItem p={4}>
            <Text fontSize="sm" mb={1}>
              <strong>Fecha de emisión:</strong> {parseDate(date)}
            </Text>
            <Text fontSize="sm" mb={1}>
              <strong>RUC/Documento de Identidad N°:</strong> {customerRuc || "-"}
            </Text>
            <Text fontSize="sm" mb={1}>
              <strong>Nombre o Razón Social:</strong> {customerName || "-"}
            </Text>
            <Text fontSize="sm">
              <strong>Correo Electrónico:</strong> {customerEmail || "-"}
            </Text>
          </GridItem>

          <GridItem p={4}>
            <Text fontWeight="bold" fontSize="sm" mb={2}>
              Condición de venta
            </Text>
            <HStack gap={4}>
              <Checkbox.Root checked={!isCredit} readOnly>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Contado</Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root checked={isCredit} readOnly>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Crédito</Checkbox.Label>
              </Checkbox.Root>
            </HStack>
          </GridItem>
        </Grid>
      </Box>


      <TableEditable
        data={details}
        labels={detailLabels}
        onDataChange={() => {}}
        readOnly={true}
        height="auto"
      />

      {/* Totales */}
      <Box borderWidth="1px" borderRadius="md" p={4}>
        <HStack justifyContent="space-between" mb={2}>
          <Text fontWeight="bold">SUBTOTAL</Text>
          <HStack gap={8}>
            <Text fontSize="sm">Exentas: {totalExentas > 0 ? parsePrice(totalExentas) : "-"}</Text>
            <Text fontSize="sm">5%: {totalIva5 > 0 ? parsePrice(totalIva5) : "-"}</Text>
            <Text fontSize="sm">10%: {totalIva10 > 0 ? parsePrice(totalIva10) : "-"}</Text>
          </HStack>
        </HStack>
        <HStack justifyContent="space-between" borderTopWidth="1px" pt={2}>
          <Text fontWeight="bold" fontSize="lg">TOTAL A PAGAR</Text>
          <Text fontWeight="bold" fontSize="lg" color="brand.primary">
            {parsePrice(totalGeneral)}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
