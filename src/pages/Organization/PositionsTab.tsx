import { useEffect, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Box, Button, ButtonGroup, Field, Grid, Heading, HStack, IconButton, Input, InputGroup, Spinner, Stack, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import { useCreatePosition, useDeletePosition, useGetPositions, useUpdatePosition } from "@/queries/positions.queries";
import type { PositionResponseDto } from "@/types/organization";

export function PositionsTab() {
  const [selected, setSelected] = useState<PositionResponseDto | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState("");
  const [defaultBasicSalary, setDefaultBasicSalary] = useState("");

  const { data, isPending, isError, error } = useGetPositions({ page, pageSize, search, sortBy: "name", sortOrder: "asc" });
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();

  useEffect(() => {
    if (isError) {
      toaster.create({ title: "Error al traer cargos", description: error?.message || "Error desconocido", type: "error" });
    }
  }, [isError, error]);

  const labels: label<PositionResponseDto>[] = [
    { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
    { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a, b) => (a.name ?? "").localeCompare(b.name ?? "") },
    { labelName: "Salario por defecto", propName: "defaultBasicSalary", transformFunction: (value) => String(value) },
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

  const saving = createPosition.isPending || updatePosition.isPending || deletePosition.isPending;

  return (
    <Box display="flex" flexDirection="column" gap={4} p={4}>
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
        noItemsComponent={<EmptyDataScreen title="No hay cargos" message="Crea un nuevo cargo para comenzar" icon={<BriefcaseBusiness />} />}
      />

      <PaginationControl pagination={data?.pagination ?? null} onPageChange={(nextPage) => setPage(nextPage)} />
    </Box>
  );
}
