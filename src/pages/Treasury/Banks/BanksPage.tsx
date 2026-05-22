import type { BankResponseDto } from "@/api/banks.api";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import {
  useGetBanks,
  useDeleteBank,
} from "@/queries/banks.queries";
import type { PaginationParams } from "@/types/types";
import {
  Box,
  IconButton,
  Input,
  InputGroup,
  NumberInput,
  Text,
} from "@chakra-ui/react";
import { Building, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const bankLabels: label<BankResponseDto>[] = [
  {
    labelName: "Nombre",
    propName: "name",
    isSortable: true,
    sortFunction: (a: BankResponseDto, b: BankResponseDto) =>
      (a.name ?? "").localeCompare(b.name ?? ""),
  },
  {
    labelName: "RUC",
    propName: "ruc",
    isSortable: true,
    sortFunction: (a: BankResponseDto, b: BankResponseDto) =>
      (a.ruc ?? "").localeCompare(b.ruc ?? ""),
  },
  {
    labelName: "Activo",
    propName: "isActive",
    isSortable: true,
    sortFunction: (a: BankResponseDto, b: BankResponseDto) =>
      Number(a.isActive) - Number(b.isActive),
    transformFunction: (value: boolean) => (value ? "Sí" : "No"),
  },
  {
    labelName: "Cant. Cuentas",
    propName: "accounts",
    isSortable: false,
    transformFunction: (value: BankResponseDto["accounts"]) =>
      String(value?.length ?? 0),
  },
];

export default function BanksPage() {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const {
    data: banks,
    isPending,
    isError,
    error,
  } = useGetBanks({
    ...params,
    pageSize:
      params.pageSize &&
      !isNaN(params.pageSize) &&
      params.pageSize >= 5 &&
      params.pageSize <= 30
        ? params.pageSize
        : 10,
  });
  const { mutate: deleteBank } = useDeleteBank();
  const [selected, setSelected] = useState<BankResponseDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al traer los bancos",
        description: error?.message || "Error desconocido",
        type: "error",
      });
    }
  }, [isError, error]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={4}
      p={4}
      height="100%"
      minHeight="0"
    >
      <Text fontSize="2xl" fontWeight="bold">
        Bancos
      </Text>

      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <InputGroup flex="1" startElement={<LuSearch />}>
          <Input placeholder="Buscar bancos..." />
        </InputGroup>

        <Box display="flex" flexDirection="row" gap={2}>
          <Text fontSize="sm" color="gray.500" alignSelf="center">
            Registros por Pág.
          </Text>
          <NumberInput.Root
            defaultValue="10"
            width="70px"
            max={30}
            min={5}
            onValueChange={(value) =>
              setParams({ ...params, pageSize: value.valueAsNumber })
            }
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Box>

        <IconButton
          padding={2}
          colorPalette="brand"
          onClick={() => navigate("/tesoreria/bancos/nuevo")}
        >
          <Plus />
          Nuevo
        </IconButton>
        <IconButton
          padding={2}
          variant="outline"
          disabled={!selected}
          onClick={() =>
            selected && navigate(`/tesoreria/bancos/${selected.id}`)
          }
        >
          <Pencil />
          Editar
        </IconButton>
        <IconButton
          padding={2}
          variant="outline"
          colorPalette="red"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              deleteBank(selected.id);
              setSelected(null);
            }
          }}
        >
          <Trash2 />
          Eliminar
        </IconButton>
      </Box>

      <Box flex="1" minHeight="0" mb={2}>
        <TableSelect
          key={JSON.stringify(banks?.banks)}
          data={banks?.banks ?? []}
          loading={isPending}
          labels={bankLabels}
          onSelect={(bank) => setSelected(bank)}
          minheight="0"
          noItemsComponent={
            <EmptyDataScreen
              title="No se encontraron bancos"
              message="No hay bancos para mostrar en este momento."
              icon={<Building />}
            />
          }
          onDoubleClick={(bank) =>
            navigate(`/tesoreria/bancos/${bank.id}`)
          }
        />

        <PaginationControl
          pagination={banks?.pagination || null}
          onPageChange={(page) => setParams({ ...params, page })}
          variant="outline"
          buttonColor="brand.primary"
          btnSize="sm"
        />
      </Box>
    </Box>
  );
}
