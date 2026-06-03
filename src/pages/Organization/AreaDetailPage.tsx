import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Pencil, Plus, Save, Trash2 } from "lucide-react";
import {
  Box,
  Button,
  ButtonGroup,
  Field,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import { useGetDepartments } from "@/queries/departments.queries";
import { useCreatePosition, useDeletePosition, useGetPositions, useUpdatePosition } from "@/queries/positions.queries";
import { parsePrice } from "@/constants/price";
import type { PositionResponseDto } from "@/types/organization";

export default function AreaDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const areaId = Number(id);
  const isGeneral = areaId === 0;

  const { data: departmentsData } = useGetDepartments({ page: 1, pageSize: 1000 });
  const areaName = isGeneral
    ? "Generales"
    : departmentsData?.departments?.find((d) => d.id === areaId)?.name ?? "Cargando...";

  const [selected, setSelected] = useState<PositionResponseDto | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState("");
  const [defaultBasicSalary, setDefaultBasicSalary] = useState("");

  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();
  const saving = createPosition.isPending || updatePosition.isPending || deletePosition.isPending;

  const { data, isPending, isError, error } = useGetPositions({
    page,
    pageSize,
    search,
    sortBy: "name",
    sortOrder: "asc",
    departmentId: areaId,
  });

  useEffect(() => {
    if (isError) {
      toaster.create({ title: "Error al traer cargos", description: error?.message || "Error desconocido", type: "error" });
    }
  }, [isError, error]);

  const labels: label<PositionResponseDto>[] = [
    { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a, b) => (a.name ?? "").localeCompare(b.name ?? "") },
    { labelName: "Salario por defecto", propName: "defaultBasicSalary", transformFunction: (value) => parsePrice(value) },
  ];

  const resetForm = () => {
    setName("");
    setDefaultBasicSalary("");
    setIsEditing(false);
    setTouched(false);
    setShowForm(false);
  };

  const onCreate = () => {
    setName("");
    setDefaultBasicSalary("");
    setIsEditing(false);
    setTouched(false);
    setShowForm(true);
  };

  const onEdit = () => {
    if (!selected) return;
    setName(selected.name ?? "");
    setDefaultBasicSalary(String(selected.defaultBasicSalary ?? 0));
    setIsEditing(true);
    setShowForm(true);
  };

  const onSave = async () => {
    setTouched(true);
    if (!name.trim()) {
      toaster.create({ title: "El nombre es requerido", type: "error" });
      return;
    }

    const body = {
      name: name.trim(),
      defaultBasicSalary: Number(defaultBasicSalary),
      departmentId: isGeneral ? null : areaId,
    };

    try {
      if (isEditing && selected) {
        await updatePosition.mutateAsync({ id: selected.id, body });
      } else {
        await createPosition.mutateAsync(body);
      }
      resetForm();
      setSelected(null);
    } catch (mutationError) {
      toaster.create({
        title: isEditing ? "No se pudo actualizar" : "No se pudo crear",
        description: mutationError instanceof Error ? mutationError.message : "Error desconocido",
        type: "error",
      });
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deletePosition.mutateAsync(selected.id);
      setSelected(null);
    } catch (mutationError) {
      toaster.create({ title: "No se pudo eliminar", description: mutationError instanceof Error ? mutationError.message : "Error desconocido", type: "error" });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={4} p={4}>
      <HStack gap={3}>
        <IconButton variant="ghost" onClick={() => navigate("/gestiones/organizacion?tab=areas")}>
          <ArrowLeft size={20} />
        </IconButton>
        <Heading size="lg">{areaName}</Heading>
      </HStack>

      <Box display="flex" flexDirection={{ base: "column", lg: "row" }} gap={3} justifyContent="space-between" alignItems={{ base: "stretch", lg: "center" }}>
        <HStack gap={3} flex={1}>
          <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", lg: "22rem" }}>
            <Input placeholder="Buscar cargos" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </InputGroup>
          <HStack display={{ base: "none", md: "flex" }}>
            <Text fontSize="sm" color="gray.500">Registros por pág.</Text>
            <PageSizeControl params={{ page, pageSize }} paramsChangeFunction={(next) => { setPageSize(next.pageSize ?? 10); setPage(1); }} min={5} max={30} />
          </HStack>
        </HStack>

        <HStack gap={2}>
          <DestructiveActionDialog title="Eliminar cargo" description="Una vez eliminado, la acción es irreversible." acceptText="Eliminar" onAccept={onDelete} trigger={<IconButton variant="outline" disabled={!selected || saving}>{deletePosition.isPending ? <Spinner size="sm" /> : <Trash2 size={18} />}Eliminar</IconButton>} />
          <IconButton variant="outline" colorPalette="brand" disabled={!selected || saving} onClick={onEdit}><Pencil size={18} />Editar</IconButton>
          <IconButton colorPalette="brand" disabled={saving} onClick={onCreate}><Plus size={18} />Nuevo</IconButton>
        </HStack>
      </Box>

      {showForm && (
        <Stack gap={4}>
          <Heading size="md">{isEditing ? "Editar cargo" : "Nuevo cargo"}</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <Field.Root invalid={touched && !name.trim()}>
              <Field.Label>
                Nombre <Text as="span" color="red.500">*</Text>
              </Field.Label>
              <Input placeholder="Nombre del cargo" value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
            </Field.Root>

            <Field.Root>
              <Field.Label>Salario base por defecto</Field.Label>
              <Input placeholder="0" type="number" min="0" value={defaultBasicSalary} onChange={(event) => setDefaultBasicSalary(event.target.value)} disabled={saving} />
            </Field.Root>
          </Grid>

          <ButtonGroup justifyContent="space-between">
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancelar
            </Button>
            <Button colorPalette="brand" onClick={onSave} disabled={saving}>
              {saving ? <Spinner size="sm" /> : <Save size={16} />}
              Guardar
            </Button>
          </ButtonGroup>
        </Stack>
      )}

      <TableSelect
        data={data?.positions ?? []}
        labels={labels}
        loading={isPending}
        onSelect={setSelected}
        noItemsComponent={<EmptyDataScreen title="No hay cargos" message="Crea un nuevo cargo para esta área" icon={<BriefcaseBusiness />} />}
      />

      <PaginationControl pagination={data?.pagination ?? null} onPageChange={(nextPage) => setPage(nextPage)} />
    </Box>
  );
}