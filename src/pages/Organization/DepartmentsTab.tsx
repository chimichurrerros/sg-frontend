import { useEffect, useMemo, useState } from "react";
import { Building2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Box, Button, ButtonGroup, Field, Heading, HStack, Input, InputGroup, Spinner, Stack, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import { useCreateDepartment, useDeleteDepartment, useGetDepartments, useUpdateDepartment } from "@/queries/departments.queries";
import type { DepartmentResponseDto } from "@/types/organization";

export function DepartmentsTab() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<DepartmentResponseDto | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState("");

  const { data, isPending, isError, error } = useGetDepartments({ page, pageSize, search, sortBy: "name", sortOrder: "asc" });
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  useEffect(() => {
    if (isError) {
      toaster.create({ title: "Error al traer áreas", description: error?.message || "Error desconocido", type: "error" });
    }
  }, [isError, error]);

  const tableData = useMemo(() => data?.departments ?? [], [data?.departments]);

  const labels: label<DepartmentResponseDto>[] = [
    { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a, b) => (a.name ?? "").localeCompare(b.name ?? "") },
  ];

  const resetForm = () => {
    setName("");
    setIsEditing(false);
    setTouched(false);
    setShowForm(false);
  };

  const onCreate = () => {
    setName("");
    setIsEditing(false);
    setTouched(false);
    setShowForm(true);
  };

  const onEdit = () => {
    if (!selected) return;
    setName(selected.name ?? "");
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
    };

    try {
      if (isEditing && selected) {
        await updateDepartment.mutateAsync({ id: selected.id, body });
      } else {
        await createDepartment.mutateAsync(body);
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
      await deleteDepartment.mutateAsync(selected.id);
      setSelected(null);
    } catch (mutationError) {
      toaster.create({ title: "No se pudo eliminar", description: mutationError instanceof Error ? mutationError.message : "Error desconocido", type: "error" });
    }
  };

  const saving = createDepartment.isPending || updateDepartment.isPending || deleteDepartment.isPending;

  return (
    <Box display="flex" flexDirection="column" gap={4} p={4}>
      <Box display="flex" flexDirection={{ base: "column", lg: "row" }} gap={3} justifyContent="space-between" alignItems={{ base: "stretch", lg: "center" }}>
        <HStack gap={3} flex={1}>
          <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", lg: "22rem" }}>
            <Input placeholder="Buscar áreas" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </InputGroup>
          <HStack display={{ base: "none", md: "flex" }}>
            <Text fontSize="sm" color="gray.500">Registros por pág.</Text>
            <PageSizeControl params={{ page, pageSize }} paramsChangeFunction={(next) => { setPageSize(next.pageSize ?? 10); setPage(1); }} min={5} max={30} />
          </HStack>
        </HStack>

        <HStack gap={2}>
          <DestructiveActionDialog title="Eliminar área" description="Una vez eliminada, la acción es irreversible." acceptText="Eliminar" onAccept={onDelete} trigger={<Button variant="outline" colorPalette="brand" disabled={!selected || saving}>{deleteDepartment.isPending ? <Spinner size="sm" /> : <Trash2 size={18} />}Eliminar</Button>} />
          <Button variant="outline" colorPalette="brand" disabled={!selected || saving} onClick={onEdit}><Pencil size={18} />Editar</Button>
          <Button colorPalette="brand" disabled={saving} onClick={onCreate}><Plus size={18} />Nuevo</Button>
        </HStack>
      </Box>

      {showForm && (
        <Stack gap={4}>
          <Heading size="md">{isEditing ? "Editar área" : "Nueva área"}</Heading>
          <Field.Root invalid={touched && !name.trim()}>
            <Field.Label>
              Nombre <Text as="span" color="red.500">*</Text>
            </Field.Label>
            <Input placeholder="Nombre del área" value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
          </Field.Root>

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
        data={tableData}
        labels={labels}
        loading={isPending}
        onSelect={setSelected}
        onDoubleClick={(item) => navigate(`/gestiones/organizacion/areas/${item.id}`)}
        noItemsComponent={<EmptyDataScreen title="No hay áreas" message="Crea una nueva área para comenzar" icon={<Building2 />} />}
      />

      <PaginationControl pagination={data?.pagination ?? null} onPageChange={(nextPage) => setPage(nextPage)} />
    </Box>
  );
}
