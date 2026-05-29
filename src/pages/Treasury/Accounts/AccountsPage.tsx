import type { AccountResponseDto } from "@/api/accounts.api";
import { accountTypeMap } from "@/api/accounts.api";
import { useGetBanks } from "@/queries/banks.queries";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import {
  useGetAccounts,
  useDeleteAccount,
} from "@/queries/accounts.queries";
import type { PaginationParams } from "@/types/types";
import {
  Box,
  IconButton,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Landmark, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const formatBalance = (value: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(value);

export default function AccountsPage() {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const {
    data: accounts,
    isPending,
    isError,
    error,
  } = useGetAccounts({
    ...params,
    pageSize:
      params.pageSize &&
      !isNaN(params.pageSize) &&
      params.pageSize >= 5 &&
      params.pageSize <= 30
        ? params.pageSize
        : 10,
  });
  const { data: banks } = useGetBanks();
  const { mutate: deleteAccount } = useDeleteAccount();
  const [selected, setSelected] = useState<AccountResponseDto | null>(null);
  const navigate = useNavigate();

  const accountLabels: label<AccountResponseDto>[] = useMemo(() => [
    {
      labelName: "Nombre",
      propName: "name",
      isSortable: true,
      sortFunction: (a: AccountResponseDto, b: AccountResponseDto) =>
        (a.name ?? "").localeCompare(b.name ?? ""),
    },
    {
      labelName: "Nro. Cuenta",
      propName: "accountNumber",
      isSortable: true,
      sortFunction: (a: AccountResponseDto, b: AccountResponseDto) =>
        (a.accountNumber ?? "").localeCompare(b.accountNumber ?? ""),
    },
    {
      labelName: "Tipo de Cuenta",
      propName: "accountType",
      isSortable: true,
      sortFunction: (a: AccountResponseDto, b: AccountResponseDto) =>
        a.accountType - b.accountType,
      transformFunction: (value: number) =>
        accountTypeMap[value] || "Desconocido",
    },
    {
      labelName: "Banco",
      propName: "bankId",
      isSortable: true,
      sortFunction: (a: AccountResponseDto, b: AccountResponseDto) =>
        (a.bankId ?? 0) - (b.bankId ?? 0),
      transformFunction: (value: number | null) => {
        if (value == null) return "-";
        return banks?.banks?.find((b) => b.id === value)?.name ?? `Banco #${value}`;
      },
    },
    {
      labelName: "Saldo Actual",
      propName: "currentBalance",
      isSortable: true,
      sortFunction: (a: AccountResponseDto, b: AccountResponseDto) =>
        a.currentBalance - b.currentBalance,
      transformFunction: (value: number) => formatBalance(value),
    },
    {
      labelName: "Saldo Disponible",
      propName: "availableBalance",
      isSortable: true,
      sortFunction: (a: AccountResponseDto, b: AccountResponseDto) =>
        a.availableBalance - b.availableBalance,
      transformFunction: (value: number) => formatBalance(value),
    },
  ], [banks]);

  useEffect(() => {
    if (isError) {
      toaster.create({
        title: "Error al traer las cuentas",
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
        Cuentas
      </Text>

      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <InputGroup flex="1" startElement={<LuSearch />}>
          <Input placeholder="Buscar cuentas..." />
        </InputGroup>

        <Box display="flex" flexDirection="row" gap={2}>
          <Text fontSize="sm" color="gray.500" alignSelf="center">
            Registros por Pág.
          </Text>
          <PageSizeControl paramsChangeFunction={setParams} params={params} max={30} min={5} />
        </Box>

        <IconButton
          padding={2}
          colorPalette="brand"
          onClick={() => navigate("/tesoreria/cuentas/nueva")}
        >
          <Plus />
          Nuevo
        </IconButton>
        <IconButton
          padding={2}
          variant="outline"
          disabled={!selected}
          onClick={() =>
            selected && navigate(`/tesoreria/cuentas/${selected.id}`)
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
              deleteAccount(selected.id);
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
          key={JSON.stringify(accounts?.accounts)}
          data={accounts?.accounts ?? []}
          loading={isPending}
          labels={accountLabels}
          onSelect={(account) => setSelected(account)}
          minheight="0"
          noItemsComponent={
            <EmptyDataScreen
              title="No se encontraron cuentas"
              message="No hay cuentas para mostrar en este momento."
              icon={<Landmark />}
            />
          }
          onDoubleClick={(account) =>
            navigate(`/tesoreria/cuentas/${account.id}`)
          }
        />

        <PaginationControl
          pagination={accounts?.pagination || null}
          onPageChange={(page) => setParams({ ...params, page })}
          variant="outline"
          buttonColor="brand.primary"
          btnSize="sm"
        />
      </Box>
    </Box>
  );
}
