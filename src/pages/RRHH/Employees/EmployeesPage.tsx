import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  Stack,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import TableSelect, { type label } from "@/components/ui/tables/table-select";
import { toaster } from "@/components/ui/toaster";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";
import { useAllBranches } from "@/queries/branches.queries";
import { useAllEmployees, useDeleteEmployee } from "@/queries/employees.queries";
import type { Employee } from "@/types/employees";

const PAGE_SIZE = 10;

interface EmployeesPageProps {
  routeBase?: string;
}

export default function EmployeesPage({
  routeBase = "/rrhh/empleados",
}: EmployeesPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useAllEmployees();
  const { data: branchesData } = useAllBranches();
  const deleteEmployee = useDeleteEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const employees = data?.employees ?? [];

  const branchNameById = useMemo(
    () => new Map((branchesData?.branches ?? []).map((branch) => [branch.id, branch.name])),
    [branchesData],
  );

  const filteredEmployees = employees.filter((employee) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      [
        employee.legajo,
        employee.firstName,
        employee.lastName,
        employee.documentNumber,
        branchNameById.get(employee.branchId ?? 0) ?? "",
        employee.areaName ?? String(employee.areaId),
        employee.positionName ?? String(employee.positionId ?? ""),
        employee.scheduleName ?? String(employee.scheduleId ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  });

  const currentEmployees = filteredEmployees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const labels: label<Employee>[] = [
    {
      labelName: "Legajo",
      propName: "legajo",
      isSortable: true,
      sortFunction: (a, b) => a.legajo.localeCompare(b.legajo),
    },
    {
      labelName: "Empleado",
      isComponent: true,
      render: (item) => `${item.firstName} ${item.lastName}`,
      isSortable: true,
      sortFunction: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      labelName: "Sucursal",
      propName: "branchId",
      textIfNull: "-",
      transformFunction: (value) => branchNameById.get(Number(value)) ?? `#${value}`,
    },
    {
      labelName: "Cargo",
      isComponent: true,
      render: (item) => item.positionName ?? `#${item.positionId ?? "-"}`,
    },
    {
      labelName: "Salario Base",
      propName: "baseSalary",
      isSortable: true,
      sortFunction: (a, b) => a.baseSalary - b.baseSalary,
      transformFunction: parsePrice,
    },
    {
      labelName: "Fecha de ingreso",
      propName: "hireDate",
      transformFunction: parseDate,
    },
  ];

  const handleDelete = () => {
    if (!selectedEmployee) return;

    deleteEmployee.mutate(selectedEmployee.id, {
      onSuccess: () => {
        toaster.create({ title: "Empleado eliminado con éxito" });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        setSelectedEmployee(null);
      },
      onError: (mutationError) => {
        toaster.create({
          title: "Error al eliminar empleado",
          description:
            mutationError instanceof Error ? mutationError.message : "Error desconocido",
          type: "error",
        });
      },
    });
  };

  return (
    <Stack gap={4} p={4}>

      {/* Filters bar */}
      <Box borderWidth="1px" borderRadius="lg" py={3} px={6}>
        <Box display="flex" flexDirection="row" gap={4} alignItems="center" flexWrap="wrap" justifyContent="space-between">
          <InputGroup startElement={<Search size={16} />} maxW={{ base: "100%", md: "22rem" }}>
            <Input
              placeholder="Buscar"
              value={searchTerm}
              variant="subtle"
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </InputGroup>

          <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
            <DestructiveActionDialog
              title="Eliminar empleado"
              description="Una vez eliminado el empleado, la acción es irreversible."
              acceptText="Eliminar"
              onAccept={handleDelete}
              trigger={
                <Button variant="outline" colorPalette="brand" disabled={!selectedEmployee || deleteEmployee.isPending}>
                  <LuTrash2 />
                  Eliminar
                </Button>
              }
            />

            <Button
              variant="outline"
              colorPalette="brand"
              disabled={!selectedEmployee}
              onClick={() => selectedEmployee && navigate(`${routeBase}/${selectedEmployee.id}`)}
            >
              <LuPencil />
              Editar
            </Button>

            <Button colorPalette="brand" onClick={() => navigate(`${routeBase}/nuevo`)}>
              <LuPlus />
              Nuevo
            </Button>
          </Box>
        </Box>
      </Box>

      <TableSelect
        data={currentEmployees}
        labels={labels}
        loading={isLoading}
        isError={isError}
        error={error instanceof Error ? error : null}
        noItemsComponent={
          <EmptyDataScreen title="No hay empleados" message="Crea un empleado para verlo en la lista." />
        }
        onSelect={(employee) => setSelectedEmployee(employee)}
        onDoubleClick={(employee) => navigate(`${routeBase}/${employee.id}?view=true`)}
      />

      <Box display="flex" justifyContent="center">
        <Pagination.Root
          count={filteredEmployees.length}
          pageSize={PAGE_SIZE}
          page={page}
          onPageChange={(event) => setPage(event.page)}
        >
          <ButtonGroup attached variant="outline" size="sm">
            <Pagination.PrevTrigger asChild>
              <IconButton>
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>
            <Pagination.Items
              render={(pageItem) => (
                <IconButton
                  variant={{ base: "outline", _selected: "solid" }}
                  zIndex={{ _selected: "1" }}
                  _selected={{ bg: "brand.primary", color: "white" }}
                >
                  {pageItem.value}
                </IconButton>
              )}
            />
            <Pagination.NextTrigger asChild>
              <IconButton>
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Box>
    </Stack>
  );
}