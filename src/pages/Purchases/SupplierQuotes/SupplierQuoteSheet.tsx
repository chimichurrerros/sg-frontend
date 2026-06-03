import { Box, Button, IconButton, Input, Spinner } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import TableEditable, { type EditableLabel } from "@/components/ui/tables/table-edit";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, FileInput, FileQuestion, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { useGetAllPurchaseRequests } from "@/queries/purchase-request.queries";
import type { PurchaseRequest } from "@/api/purchaseRequest.api";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { useCreateSupplierQuote, useEditSupplierQuote, useGetSupplierQuoteById } from "@/queries/supplier-quotes.queries";
import { useGetRequestForQuotationBySupplierAndPR } from "@/queries/request-for-quotation.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import type { BackendError } from "@/types/types";
import { toaster } from "@/components/ui/toaster";
import { supplierQuoteStatusMap } from "@/types/purchases";
import { parseDate } from "@/constants/date";
import { useAllSuppliers } from "@/queries/suppliers.queries";
import type { CreateSupplierQuoteProduct, EditSupplierQuoteRequest } from "@/api/supplierQuote.api";
import { parsePrice } from "@/constants/price";

interface SupplierQuoteSheetProps {
  mode: "create" | "edit";
}

interface ProductRow {
  id: number;
  productId: number;
  productName: string;
  quantityRequested: number;
  price?: number;
  taxRate?: number;
}

export default function SupplierQuoteSheet({ mode }: SupplierQuoteSheetProps) {
  const { data: purchaseRequests, isPending: loadingPurchaseRequests, isError: isPurchaseRequestsError, error: purchaseReqError } = useGetAllPurchaseRequests();
  const { data: suppliers, isPending: loadingSuppliers, isError: isErrorSuppliers, error: errorSuppliers } = useAllSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const { id } = useParams();
  const { data: quoteData, isPending: loadingQuoteData, error: quoteDataError, isError: isQuoteDataError } = useGetSupplierQuoteById(mode === "edit" ? parseInt(id!) : -1);
  const [selectedPurchaseRequestId, setSelectedPurchaseRequestId] = useState<number | null>(null);
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [errorBody, setErrorBody] = useState<BackendError | null>(null);
  const [saleOrderId, setSaleOrderId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [requestForQuotationId, setRequestForQuotationId] = useState<number | null>(null);

  const createSupplierQuote = useCreateSupplierQuote();
  const editSupplierQuote = useEditSupplierQuote();
  const navigate = useNavigate();

  const {
    data: rfq,
    isPending: loadingRfq,
  } = useGetRequestForQuotationBySupplierAndPR(
    selectedSupplierId ?? 0,
    mode === "create" ? (selectedPurchaseRequestId ?? 0) : 0,
  );

  const labels: EditableLabel<ProductRow>[] = [
    { labelName: "ID", propName: "id" },
    {
      labelName: "Nombre", propName: "productName",
      isSortable: true, sortFunction: (a: ProductRow, b: ProductRow) => a.productName.localeCompare(b.productName),
    },
    {
      labelName: "Cantidad Pedida", propName: "quantityRequested",
      isEditable: true,
      isSortable: true,
      validate: (value: number | string) => Number(value) > 0,
      sortFunction: (a: ProductRow, b: ProductRow) => a.quantityRequested - b.quantityRequested,
    },
    {
      labelName: "Precio Unitario", propName: "price",
      isEditable: true,
      formatFunction: (value) => parsePrice(value ?? 0),
      isSortable: true,
      textIfNull: "0",
      inputType: "number",
      sortFunction: (a: ProductRow, b: ProductRow) => (a.price || 0) - (b.price || 0),
    },
  ];

  const isReadOnly = useMemo(() =>
    saleOrderId !== null || (mode === "edit" && quoteData ? quoteData.state === 2 : false),
  [saleOrderId, mode, quoteData]);

  const filteredSuppliers = useMemo(() => {
    if (!suppliers || !selectedPurchaseRequest?.supplierIds) return [];
    return suppliers.suppliers.filter(sp => selectedPurchaseRequest.supplierIds.includes(sp.id));
  }, [suppliers, selectedPurchaseRequest?.supplierIds]);

  // Load edit mode data
  useEffect(() => {
    if (!quoteData) return;
    setSelectedPurchaseRequestId(quoteData.purchaseRequestId);
    setSelectedSupplierId(quoteData.supplierId);
    setSaleOrderId(quoteData.associatedPurchaseOrderId ?? null);
    setRequestForQuotationId(quoteData.requestForQuotationId ?? null);
    setSelectedPurchaseRequest(
      purchaseRequests?.purchaseRequests.find(pr => pr.id === quoteData.purchaseRequestId) || null,
    );
    setProducts((quoteData.details ?? []).map(d => ({
      id: d.id,
      productId: d.productId,
      productName: d.productName,
      quantityRequested: d.quantityAvailable,
      price: d.price,
    })));
  }, [quoteData]);

  // Load RFQ products when RFQ is fetched in create mode
  useEffect(() => {
    if (mode !== "create" || !rfq) return;
    setRequestForQuotationId(rfq.id);
    setProducts(rfq.products.map(p => ({
      id: p.productId,
      productId: p.productId,
      productName: p.productName,
      quantityRequested: p.quantityRequested,
      price: undefined,
      taxRate: undefined,
    })));
  }, [rfq, mode]);

  // Clear products when supplier or PR changes in create mode (will re-fetch RFQ)
  useEffect(() => {
    if (mode !== "create") return;
    setRequestForQuotationId(null);
    setProducts([]);
  }, [selectedSupplierId, selectedPurchaseRequestId, mode]);

  // Track selected PR object
  useEffect(() => {
    if (!selectedPurchaseRequestId || !purchaseRequests) return;
    setSelectedPurchaseRequest(
      purchaseRequests.purchaseRequests.find(pr => pr.id === selectedPurchaseRequestId) || null,
    );
  }, [selectedPurchaseRequestId, purchaseRequests]);

  useEffect(() => {
    if (isQuoteDataError) {
      const body = (quoteDataError as any).response?.data;
      setErrorBody(body as BackendError);
    }
  }, [isQuoteDataError]);

  useEffect(() => {
    if (isPurchaseRequestsError) {
      toaster.create({ title: "Error al traer los pedidos de compra", description: purchaseReqError.message, type: "error" });
    }
  }, [isPurchaseRequestsError]);

  useEffect(() => {
    if (isErrorSuppliers) {
      toaster.create({ title: "Error al traer la lista de proveedores", description: errorSuppliers.name || "Error desconocido", type: "error" });
    }
  }, [isErrorSuppliers, errorSuppliers]);

  function saveSupplierQuoteChanges() {
    if (!selectedPurchaseRequestId || !selectedSupplierId || !quoteData) return;
    const data: EditSupplierQuoteRequest = {
      supplierId: selectedSupplierId,
      purchaseRequestId: selectedPurchaseRequestId,
      requestForQuotationId: requestForQuotationId ?? undefined,
      details: products.map((p) => ({
        productId: p.productId,
        quantityAvailable: p.quantityRequested,
        price: p.price ?? 0,
        taxRate: p.taxRate,
      })),
    };
    editSupplierQuote.mutate({ id: quoteData.id, data });
  }

  function createQuote() {
    if (!selectedSupplierId || !selectedPurchaseRequestId || !requestForQuotationId) return;
    createSupplierQuote.mutate({
      supplierId: selectedSupplierId,
      purchaseRequestId: selectedPurchaseRequestId,
      requestForQuotationId,
      details: products.map((p) => ({
        productId: p.productId,
        quantityAvailable: p.quantityRequested,
        price: p.price ?? 0,
        taxRate: p.taxRate,
      })),
    }, {
      onSuccess: () => navigate("/compras/cotizaciones-proveedores"),
    });
  }

  if (loadingQuoteData && mode !== "create") {
    return (
      <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
        <LoadingScreen message="Cargando cotización..." />
      </Box>
    );
  }

  if (isQuoteDataError) {
    return (
      <Box display="flex" flexDirection="column" gap={4} height="full" alignItems="center" justifyContent="center">
        <ErrorScreen title="Error al cargar la cotización" errorMessage={errorBody?.title || quoteDataError.message || "Error desconocido"} />
      </Box>
    );
  }

  const isSaveDisabled = !selectedPurchaseRequestId || !selectedSupplierId
    || products.length === 0
    || products.some(p => !p.price)
    || (mode === "create" && !requestForQuotationId);

  return (
    <Box display="flex" flexDirection="column" gap={4} height="full" minHeight="0">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" flexDirection="column" gap={1}>
          <Text fontSize="2xl" fontWeight="bold">
            {mode === "create" ? "Nueva Cotización de Proveedor" : `Editar Cotización #${id}`}
          </Text>
          {mode === "edit" && saleOrderId && (
            <Text fontSize="sm" color="gray" fontStyle="italic">
              Esta cotización no es editable puesto que ya tiene una orden de compra asociada.
            </Text>
          )}
        </Box>
        <Box display="flex" gap={4}>
          <IconButton p={2} variant="outline" size="lg" onClick={() => navigate("/compras/cotizaciones-proveedores")}>
            <ArrowLeft />
            Volver al listado
          </IconButton>
          {mode === "create" && (
            <ConfirmActionDialog
              trigger={
                <IconButton p={2} bgColor="brand.secondary" disabled={isSaveDisabled} size="lg">
                  {createSupplierQuote.isPending ? <Spinner /> : <FileInput />}
                  Crear cotización
                </IconButton>
              }
              title="Crear Cotización"
              description={
                "Se generará la cotización para " +
                (suppliers?.suppliers.find(s => s.id === selectedSupplierId)?.businessName?.toUpperCase() ?? "")
              }
              onAccept={() => createQuote()}
            />
          )}
          {mode === "edit" && (
            <IconButton p={2} bgColor="brand.primary" disabled={!saleOrderId} size="lg"
              onClick={() => quoteData?.associatedPurchaseOrderId && navigate("/compras/ordenes-de-compra/" + quoteData?.associatedPurchaseOrderId)}
            >
              <ExternalLink />
              Ver Orden de Compra asociada
            </IconButton>
          )}
        </Box>
      </Box>

      <Box>
        <Box display="flex" flexWrap="wrap" gap={6} my={6}>
          <Box minWidth="250px" flex="1">
            <Box display="flex" flexDirection="row" gap={2}>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Pedido de Compra *</Text>
              <Spinner size="sm" ml={2} display={loadingPurchaseRequests ? "block" : "none"} />
            </Box>
            <SelectWrapper
              disabled={loadingPurchaseRequests || isPurchaseRequestsError || saleOrderId !== null}
              options={purchaseRequests?.purchaseRequests.map((pr) => ({
                value: pr.id.toString(),
                label: `${pr.id} - ${pr.userName} - ${parseDate(pr.date)}`,
              })) || []}
              placeholder="Selecciona un pedido de compra"
              width="full"
              value={selectedPurchaseRequestId?.toString() || ""}
              onValueChange={(value) => {
                setSelectedPurchaseRequestId(parseInt(value));
              }}
            />
          </Box>
          <Box minWidth="250px" flex="1">
            <Box display="flex" flexDirection="row" gap={3}>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Proveedores *</Text>
              {loadingSuppliers && <Spinner size="sm" />}
            </Box>
            <SelectWrapper
              options={filteredSuppliers.map((sp) => ({
                value: sp.id.toString(),
                label: sp.businessName,
              }))}
              width="100%"
              placeholder={selectedPurchaseRequestId ? "Selecciona un proveedor" : "Selecciona un pedido de compra primero"}
              disabled={saleOrderId !== null || !selectedPurchaseRequestId}
              value={selectedSupplierId?.toString() || ""}
              onValueChange={(value) => setSelectedSupplierId(Number(value))}
            />
          </Box>
          <Box minWidth="250px" flex="1">
            <Text fontSize="sm" fontWeight="medium" mb={1}>Fecha de Cotización</Text>
            <Input value={quoteData ? parseDate(quoteData.date) : parseDate(new Date())} readOnly />
          </Box>
          {mode === "edit" && (
            <Box minWidth="250px" flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={1}>Situación</Text>
              <Input color={quoteData?.state === 2 ? "red.600" : ""} value={quoteData ? supplierQuoteStatusMap[quoteData.state] : "Desconocido"} readOnly />
            </Box>
          )}
        </Box>

        <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" height="47vh">
          <TableEditable
            key={JSON.stringify(products)}
            labels={labels}
            data={products}
            height="100%"
            readOnly={isReadOnly}
            noItemsComponent={
              <EmptyDataScreen
                title="No se encontraron productos"
                message={
                  !selectedPurchaseRequestId
                    ? "Selecciona un pedido de compra para cargar sus productos."
                    : !selectedSupplierId
                    ? "Selecciona un proveedor para cargar los productos solicitados."
                    : loadingRfq
                    ? "Buscando solicitud de cotización..."
                    : "No se encontró una solicitud de cotización para esta combinación de pedido y proveedor."
                }
                icon={<FileQuestion size={48} color="gray" />}
              />
            }
            onDataChange={(newData: ProductRow[]) => setProducts(newData)}
          />
        </Box>

        {mode === "edit" && (
          <Box display="flex" justifyContent="space-between" mt={6}>
            <Button variant="outline" colorScheme="gray" size="lg" onClick={() => navigate("/compras/cotizaciones-proveedores")}>
              Cancelar
            </Button>
            <ConfirmActionDialog
              trigger={
                <IconButton p={2} bgColor="brand.primary" size="lg"
                  disabled={isSaveDisabled || editSupplierQuote.isPending}>
                  {editSupplierQuote.isPending ? <Spinner /> : <Save />}
                  Guardar
                </IconButton>
              }
              title={"Editar Cotización #" + quoteData?.id + "?"}
              description="Se guardarán los cambios hechos a la cotización"
              onAccept={saveSupplierQuoteChanges}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
