import { Box, Spinner } from "@chakra-ui/react";
import {
  IconButton,
  Input,
  Text,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { ArrowLeft, Save, Plus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BillDetail } from "@/types/bill-detail";
import TableSelect, { type label } from "@/components/ui/table-select";
import {
  useAllBills,
  useCreateBill,
  useEditBill,
} from "@/queries/bills.queries";
import {
  useBillDetailsByBillId,
  useCreateBillDetail,
  useEditBillDetail,
} from "@/queries/bill-details.queries";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { toaster } from "@/components/ui/toaster";

export default function BillFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== "nueva";

  const [formNumber, setFormNumber] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formTotal, setFormTotal] = useState("");
  const [formTaxTotal, setFormTaxTotal] = useState("");
  const [formBillType, setFormBillType] = useState("1");
  const [formBillState, setFormBillState] = useState("0");
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formPaymentTerms, setFormPaymentTerms] = useState("");
  const [formIsCredit, setFormIsCredit] = useState(false);

  const [details, setDetails] = useState<BillDetail[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<BillDetail | null>(null);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);
  const [formDetailProductId, setFormDetailProductId] = useState("");
  const [formDetailQuantity, setFormDetailQuantity] = useState("");
  const [formDetailPrice, setFormDetailPrice] = useState("");
  const [formDetailTaxRate, setFormDetailTaxRate] = useState("10");

  const { data: allBills, isPending: loadingBills } = useAllBills();
  const {
    data: billDetailsData,
    isPending: loadingDetails,
    refetch: refetchDetails,
  } = useBillDetailsByBillId(id ? parseInt(id) : 0);
  const createBill = useCreateBill();
  const editBill = useEditBill();
  const createDetail = useCreateBillDetail();
  const editDetail = useEditBillDetail();

  useEffect(() => {
    if (id && !isNaN(parseInt(id)) && allBills?.bills) {
      const bill = allBills.bills.find((b) => b.id === parseInt(id));
      if (bill) {
        setFormNumber(bill.number);
        setFormDate(bill.date);
        setFormDueDate(bill.dueDate || "");
        setFormTotal(bill.total.toString());
        setFormTaxTotal(bill.taxTotal.toString());
        setFormBillType(bill.billType.toString());
        setFormBillState(bill.billState.toString());
        setFormCustomerId(bill.customerId.toString());
        setFormPaymentTerms(bill.paymentTerms || "");
        setFormIsCredit(bill.isCredit);
      }
    }
  }, [id, allBills]);

  useEffect(() => {
    if (billDetailsData?.billDetails) {
      setDetails(billDetailsData.billDetails);
    }
  }, [billDetailsData]);

  const detailLabels: label<BillDetail>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Producto", propName: "productId" },
    { labelName: "Cantidad", propName: "quantity" },
    { labelName: "Precio", propName: "price" },
    { labelName: "Tasa IVA", propName: "taxRate" },
  ];

  const handleSubmitBill = async () => {
    if (!formNumber.trim() || !formDate || !formTotal || !formCustomerId) {
      toaster.create({
        title: "Error",
        description: "Número, fecha, total y cliente son requeridos",
        type: "error",
      });
      return;
    }

    const billData = {
      number: formNumber,
      date: formDate,
      dueDate: formDueDate || undefined,
      total: parseFloat(formTotal),
      taxTotal: parseFloat(formTaxTotal) || 0,
      billType: parseInt(formBillType),
      billState: parseInt(formBillState),
      customerId: parseInt(formCustomerId),
      paymentTerms: formPaymentTerms || undefined,
      isCredit: formIsCredit,
    };

    try {
      if (isEditing && id) {
        await editBill.mutateAsync({ id: parseInt(id), data: billData });
        toaster.create({
          title: "Éxito",
          description: `${formNumber} actualizada`,
          type: "success",
        });
      } else {
        const result = await createBill.mutateAsync(billData);
        toaster.create({
          title: "Éxito",
          description: `${formNumber} creada`,
          type: "success",
        });
        navigate(`/ventas/facturas/${result.bill.id}`, { replace: true });
      }
    } catch {
      toaster.create({
        title: "Error",
        description: isEditing ? "No se pudo actualizar" : "No se pudo crear",
        type: "error",
      });
    }
  };

  const handleNewDetail = () => {
    if (!isEditing) {
      toaster.create({
        title: "Error",
        description: "Guardá la factura primero",
        type: "error",
      });
      return;
    }
    setFormDetailProductId("");
    setFormDetailQuantity("");
    setFormDetailPrice("");
    setFormDetailTaxRate("10");
    setIsEditingDetail(false);
    setEditingDetailId(null);
    setShowDetailForm(true);
  };

  const handleEditDetail = () => {
    if (!selectedDetail) return;
    setFormDetailProductId(selectedDetail.productId.toString());
    setFormDetailQuantity(selectedDetail.quantity.toString());
    setFormDetailPrice(selectedDetail.price.toString());
    setFormDetailTaxRate(selectedDetail.taxRate.toString());
    setIsEditingDetail(true);
    setEditingDetailId(selectedDetail.id);
    setShowDetailForm(true);
  };

  const handleSubmitDetail = async () => {
    if (!formDetailProductId || !formDetailQuantity || !formDetailPrice) {
      toaster.create({
        title: "Error",
        description: "Producto, cantidad y precio requeridos",
        type: "error",
      });
      return;
    }

    const detailData = {
      billId: parseInt(id || "0"),
      productId: parseInt(formDetailProductId),
      quantity: parseFloat(formDetailQuantity),
      price: parseFloat(formDetailPrice),
      taxRate: parseFloat(formDetailTaxRate) || 0,
    };

    try {
      if (isEditingDetail && editingDetailId) {
        await editDetail.mutateAsync({ id: editingDetailId, data: detailData });
        toaster.create({
          title: "Éxito",
          description: "Detalle actualizado",
          type: "success",
        });
      } else {
        await createDetail.mutateAsync(detailData);
        toaster.create({
          title: "Éxito",
          description: "Detalle creado",
          type: "success",
        });
      }
      setShowDetailForm(false);
      setSelectedDetail(null);
      refetchDetails();
    } catch {
      toaster.create({
        title: "Error",
        description: "Error al guardar detalle",
        type: "error",
      });
    }
  };

  const handleCancelDetail = () => {
    setShowDetailForm(false);
    setIsEditingDetail(false);
    setEditingDetailId(null);
  };

  const isPending =
    createBill.isPending ||
    editBill.isPending ||
    createDetail.isPending ||
    editDetail.isPending;
  const isLoading = loadingBills || loadingDetails;

  if (isLoading && isEditing) {
    return (
      <Box p={5}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={5} display="flex" flexDirection="column" gap={4}>
      <HStack justifyContent="space-between">
        <HStack>
          {/* <IconButton
            aria-label="Volver"
            onClick={() => navigate("/ventas/facturas")}
          >
            <ArrowLeft size={20} />
          </IconButton> */}
          <Text fontWeight="bold" fontSize="2xl">
            {isEditing ? `Factura ${formNumber}` : "Nueva Factura"}
          </Text>
        </HStack>
        <Button
          bg="brand.primary"
          onClick={handleSubmitBill}
          disabled={isPending}
        >
          {isPending ? (
            <Spinner size="sm" color="white" />
          ) : isEditing ? (
            <Save size={18} />
          ) : (
            <Plus size={18} />
          )}
          {isEditing ? "Guardar" : "Crear"}
        </Button>
      </HStack>

      <HStack alignItems="flex-start" gap={4}>
        <Box flex={1} borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
          <VStack align="stretch" gap={3}>
            <Text fontWeight="bold" fontSize="lg">
              Datos Factura
            </Text>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Número
              </Text>
              <Input
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="001-001-000000001"
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Fecha
              </Text>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Vencimiento
              </Text>
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                ID Cliente
              </Text>
              <Input
                type="number"
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
              />
            </Box>
          </VStack>
        </Box>

        <Box flex={1} borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
          <VStack align="stretch" gap={3}>
            <Text fontWeight="bold" fontSize="lg">
              Valores
            </Text>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Total
              </Text>
              <Input
                type="number"
                value={formTotal}
                onChange={(e) => setFormTotal(e.target.value)}
                placeholder="0"
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                IVA
              </Text>
              <Input
                type="number"
                value={formTaxTotal}
                onChange={(e) => setFormTaxTotal(e.target.value)}
                placeholder="0"
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Tipo
              </Text>
              <select
                value={formBillType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormBillType(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="1">Contado</option>
                <option value="2">Crédito</option>
              </select>
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Estado
              </Text>
              <select
                value={formBillState}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormBillState(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="0">Pendiente</option>
                <option value="1">Pagada</option>
                <option value="2">Anulada</option>
              </select>
            </Box>
          </VStack>
        </Box>

        <Box flex={1} borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
          <VStack align="stretch" gap={3}>
            <Text fontWeight="bold" fontSize="lg">
              Información Adicional
            </Text>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Términos de Pago
              </Text>
              <Input
                value={formPaymentTerms}
                onChange={(e) => setFormPaymentTerms(e.target.value)}
                placeholder="Contado"
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Es Crédito
              </Text>
              <select
                value={formIsCredit ? "1" : "0"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormIsCredit(e.target.value === "1")
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="0">No</option>
                <option value="1">Sí</option>
              </select>
            </Box>
          </VStack>
        </Box>
      </HStack>

      {isEditing && (
        <Box borderWidth="1px" borderRadius="md" p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Text fontWeight="bold" fontSize="lg">
              Detalles de Factura
            </Text>
            <HStack>
              <IconButton
                aria-label="Editar detalle"
                disabled={!selectedDetail}
                onClick={handleEditDetail}
              >
                <Pencil size={20} />
              </IconButton>
              <IconButton
                aria-label="Nuevo detalle"
                bg="brand.primary"
                onClick={handleNewDetail}
              >
                <Plus size={20} />
              </IconButton>
            </HStack>
          </HStack>

          {showDetailForm && (
            <Box borderWidth="1px" borderRadius="md" p={3} mb={4} bg="gray.50">
              <HStack gap={3}>
                <Box flex={1}>
                  <Text mb={1} fontSize="sm">
                    Producto ID
                  </Text>
                  <Input
                    type="number"
                    value={formDetailProductId}
                    onChange={(e) => setFormDetailProductId(e.target.value)}
                  />
                </Box>
                <Box flex={1}>
                  <Text mb={1} fontSize="sm">
                    Cantidad
                  </Text>
                  <Input
                    type="number"
                    value={formDetailQuantity}
                    onChange={(e) => setFormDetailQuantity(e.target.value)}
                  />
                </Box>
                <Box flex={1}>
                  <Text mb={1} fontSize="sm">
                    Precio
                  </Text>
                  <Input
                    type="number"
                    value={formDetailPrice}
                    onChange={(e) => setFormDetailPrice(e.target.value)}
                  />
                </Box>
                <Box flex={1}>
                  <Text mb={1} fontSize="sm">
                    Tasa IVA
                  </Text>
                  <Input
                    type="number"
                    value={formDetailTaxRate}
                    onChange={(e) => setFormDetailTaxRate(e.target.value)}
                  />
                </Box>
              </HStack>
              <HStack mt={3} justifyContent="flex-end">
                <Button variant="outline" onClick={handleCancelDetail}>
                  Cancelar
                </Button>
                <Button
                  bg="brand.primary"
                  onClick={handleSubmitDetail}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Spinner size="sm" color="white" />
                  ) : isEditingDetail ? (
                    "Guardar"
                  ) : (
                    "Agregar"
                  )}
                </Button>
              </HStack>
            </Box>
          )}

          <TableSelect
            data={details}
            loading={loadingDetails}
            labels={detailLabels}
            noItemsComponent={
              <EmptyDataScreen
                title="No hay detalles"
                message="Agregá detalles a la factura"
              />
            }
            onSelect={(item) => setSelectedDetail(item)}
          />
        </Box>
      )}
    </Box>
  );
}
