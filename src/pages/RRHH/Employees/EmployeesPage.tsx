import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  Collapsible,
  Field,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  Portal,
  Select,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import TableSelect, { type label } from "@/components/ui/table-select";
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
  const [showFilters, setShowFilters] = useState(false);
  const [branchFilter, setBranchFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const employees = data?.employees ?? [];

  const branchNameById = useMemo(
    () => new Map((branchesData?.branches ?? []).map((branch) => [branch.id, branch.name])),
    [branchesData],
  );

  const branchCollection = useMemo(
    () =>
      createListCollection({
        items: (branchesData?.branches ?? []).map((branch) => ({
          label: branch.name,
          value: String(branch.id),
        })),
      }),
    [branchesData],
  );

  const statusCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "ACTIVO", value: "ACTIVO" },
          { label: "RECESO", value: "RECESO" },
        ],
      }),
    [],
  );

  const filteredEmployees = employees.filter((employee) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
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
        .includes(term);

    const matchesBranch =
      branchFilter.length === 0 ||
      branchFilter.includes(String(employee.branchId ?? ""));
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(employee.status);

    return matchesSearch && matchesBranch && matchesStatus;
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

      <Box
        display="flex"
        flexDirection={{ base: "column", lg: "row" }}
        gap={3}
        alignItems={{ base: "stretch", lg: "center" }}
        justifyContent="space-between"
      >
        <Box
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          gap={3}
          alignItems={{ base: "stretch", md: "center" }}
        >
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

          <Button variant="outline" colorPalette="brand" onClick={() => setShowFilters((current) => !current)}>
            <Filter size={16} />
            Filtros Avanzados
          </Button>
        </Box>

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

      <Collapsible.Root open={showFilters}>
          <Collapsible.Content>
          <Box borderWidth="1px" rounded="md" p={4} bg="bg.subtle">
            <Stack gap={4}>
              <Text fontWeight="semibold">Filtros</Text>
              <Box display="grid" gap={4} gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
                <Field.Root>
                  <Field.Label>Sucursal</Field.Label>
                  <Select.Root
                    collection={branchCollection}
                    value={branchFilter}
                    multiple
                    onValueChange={(event) => {
                      setBranchFilter(event.value);
                      setPage(1);
                    }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Todas" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {branchCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Estado</Field.Label>
                  <Select.Root
                    collection={statusCollection}
                    value={statusFilter}
                    multiple
                    onValueChange={(event) => {
                      setStatusFilter(event.value);
                      setPage(1);
                    }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Todos" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {statusCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>
              </Box>
            </Stack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>

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