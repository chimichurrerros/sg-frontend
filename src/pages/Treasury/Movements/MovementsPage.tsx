import {
  movementTypeMap,
  type BankMovementResponseDto,
} from "@/api/bankMovements.api";
import { parseDate } from "@/constants/date";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { toaster } from "@/components/ui/toaster";
import { useGetAccounts } from "@/queries/accounts.queries";
import { useGetMovements } from "@/queries/bankMovements.queries";
import type { PaginationParams } from "@/types/types";
import { Box, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { ArrowUpDown, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/ui/title";

const formatBalance = (value: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => parseDate(value);

export default function MovementsPage() {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const {
    data: movements,
    isPending,
    isError,
    error,
  } = useGetMovements({
    ...params,
    pageSize:
      params.pageSize &&
      !isNaN(params.pageSize) &&
      params.pageSize >= 5 &&
      params.pageSize <= 30
        ? params.pageSize
        : 10,
  });
  const { data: accountsData } = useGetAccounts({ page: 1, pageSize: 100 });
  const navigate = useNavigate();

  const accountsMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const a of accountsData?.accounts ?? []) {
      map[a.id] = a.name ?? `Cuenta #${a.id}`;
    }
    return map;
  }, [accountsData]);

  const movementLabels: label<BankMovementResponseDto>[] = useMemo(
    () => [
      {
        labelName: "Fecha",
        propName: "date",
        isSortable: true,
        sortFunction: (
          a: BankMovementResponseDto,
          b: BankMovementResponseDto,
        ) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        transformFunction: (value: string) => formatDate(value),
      },
      {
        labelName: "Cuenta",
        isComponent: true,
        render: (item: BankMovementResponseDto) => (
          <Text>
            {accountsMap[item.accountId] ?? `Cuenta #${item.accountId}`}
          </Text>
        ),
        isSortable: true,
        sortFunction: (
          a: BankMovementResponseDto,
          b: BankMovementResponseDto,
        ) =>
          (accountsMap[a.accountId] ?? "").localeCompare(
            accountsMap[b.accountId] ?? "",
          ),
      },
      {
        labelName: "Concepto",
        propName: "description",
        textIfNull: "-",
        isSortable: true,
        sortFunction: (
          a: BankMovementResponseDto,
          b: BankMovementResponseDto,
        ) => (a.description ?? "").localeCompare(b.description ?? ""),
      },
      {
        labelName: "Tipo",
        propName: "movementType",
        isSortable: true,
        sortFunction: (
          a: BankMovementResponseDto,
          b: BankMovementResponseDto,
        ) => a.movementType - b.movementType,
        isComponent: true,
        render: (item: BankMovementResponseDto) => {
          return (
            <Text
              color={
                item.movementType === 1
                  ? "red.600"
                  : item.movementType === 2
                    ? "green.600"
                    : ""
              }
            >
              {movementTypeMap[item.movementType] || "Desconocido"}
            </Text>
          );
        },
      },
      {
        labelName: "Monto",
        propName: "amount",
        isSortable: true,
        sortFunction: (
          a: BankMovementResponseDto,
          b: BankMovementResponseDto,
        ) => a.amount - b.amount,
        isComponent: true,
        render: (item: BankMovementResponseDto) => {
          return (
            <Text
              color={
                item.movementType === 1
                  ? "red.600"
                  : item.movementType === 2
                    ? "green.600"
                    : ""
              }
              fontWeight="medium"
            >
              {formatBalance(item.amount)}
            </Text>
          );
        },
      },
    ],
    [accountsMap],
  );

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al traer los movimientos bancarios",
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
      <PageTitle>
        Movimientos Bancarios
      </PageTitle>

      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <InputGroup flex="1" startElement={<LuSearch />}>
          <Input placeholder="Buscar movimientos..." />
        </InputGroup>

        <Box display="flex" flexDirection="row" gap={2}>
          <Text fontSize="sm" color="gray.500" alignSelf="center">
            Registros por Pág.
          </Text>
          <PageSizeControl
            paramsChangeFunction={setParams}
            params={params}
            max={30}
            min={5}
          />
        </Box>

        <IconButton
          padding={2}
          colorPalette="brand"
          onClick={() => navigate("/tesoreria/movimientos/nueva")}
        >
          <Plus />
          Nuevo
        </IconButton>
      </Box>

      <Box flex="1" minHeight="0" mb={2}>
        <TableSelect
          key={JSON.stringify(movements?.bankMovements)}
          data={movements?.bankMovements ?? []}
          loading={isPending}
          labels={movementLabels}
          onSelect={() => {}}
          minheight="0"
          noItemsComponent={
            <EmptyDataScreen
              title="No se encontraron movimientos"
              message="No hay movimientos bancarios para mostrar en este momento."
              icon={<ArrowUpDown />}
            />
          }
          onDoubleClick={(movement) =>
            navigate(`/tesoreria/movimientos/${movement.id}`)
          }
        />

        <PaginationControl
          pagination={movements?.pagination || null}
          onPageChange={(page) => setParams({ ...params, page })}
          variant="outline"
          buttonColor="brand.primary"
          btnSize="sm"
        />
      </Box>
    </Box>
  );
}
