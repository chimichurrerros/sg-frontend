import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { useCreatePurchaseRequest } from "@/queries/purchase-request.queries";
import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuArrowLeft, LuCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import PurchaseProductsTable, {
  type PurchaseProductRow,
} from "../components/PurchaseProductsTable";

export default function PurchaseRequestCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createPurchaseRequest, isPending } =
    useCreatePurchaseRequest();
  const [observation, setObservation] = useState("");
  const [products, setProducts] = useState<PurchaseProductRow[]>([]);

  const handleCreate = () => {
    if (products.length === 0) {
      toaster.create({
        title: "Debe agregar al menos un producto",
        type: "error",
      });
      return;
    }

    createPurchaseRequest(
      {
        observation,
        details: products.map((p) => ({
          productId: p.productId,
          quantityRequested: p.quantityRequested,
        })),
      },
      {
        onSuccess: () => {
          toaster.create({ title: "Pedido de compra creado con éxito" });
          queryClient.invalidateQueries({ queryKey: ["purchaseRequests"] });
          navigate("/compras/pedidos");
        },
        onError: (error) => {
          toaster.create({
            title: "Error al crear el pedido de compra",
            description: error.message,
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Stack gap={4} paddingInline="5%" height="100%">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="xl">Nuevo Pedido de Compra</Heading>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="start"
          onClick={() => navigate("/compras/pedidos")}
        >
          <LuArrowLeft /> Volver al listado
        </Button>
      </Flex>

      <Stack gap={4} height="100%" display="flex" flexDirection="column">
        <Field.Root>
          <Field.Label>Observación</Field.Label>
          <Textarea
            placeholder="Observaciones del pedido..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            disabled={isPending}
          />
        </Field.Root>

        <Text fontWeight="semibold" fontSize="sm" mt={2}>
          Productos
        </Text>

        <Box flex="1" minHeight="0">
          <PurchaseProductsTable
            products={products}
            onDataChange={setProducts}
            readOnly={false}
          />
        </Box>

        {isPending && (
          <Text color="gray.500" fontSize="sm">
            Creando pedido de compra...
          </Text>
        )}

        <ConfirmActionDialog
          title="Confirmar Pedido de Compra"
          description="¿Estás seguro de que deseas registrar este pedido de compra?"
          acceptText="Solicitar"
          onAccept={handleCreate}
          trigger={
            <Button
              colorPalette="brand"
              loading={isPending}
              alignSelf="start"
              disabled={products.length === 0}
            >
              <LuCheck /> Solicitar Pedido
            </Button>
          }
        />
      </Stack>
    </Stack>
  );
}
