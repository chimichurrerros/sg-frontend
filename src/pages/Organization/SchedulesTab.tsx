import { useEffect, useState } from "react";
import { Clock3, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Box, Button, ButtonGroup, Field, Grid, Heading, HStack, IconButton, Input, InputGroup, Spinner, Stack, Text, createListCollection, Portal, Select } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import EmptyDataScreen from "@/components/ui/screens/empty-data-screen";
import TableSelect, { type label } from "@/components/ui/table-select";
import PageSizeControl from "@/components/ui/page-size-control";
import PaginationControl from "@/components/ui/pagination-control";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import { useCreateSchedule, useDeleteSchedule, useGetSchedules, useUpdateSchedule } from "@/queries/schedules.queries";
import type { ScheduleResponseDto, ScheduleTypeEnum } from "@/types/organization";

const scheduleTypeCollection = createListCollection({
  items: [
    { label: "Desconocido", value: String(0) },
    { label: "Mañana", value: String(1) },
    { label: "Tarde", value: String(2) },
    { label: "Noche", value: String(3) },
    { label: "Tiempo completo", value: String(4) },
    { label: "Medio tiempo", value: String(5) },
  ],
});

export function SchedulesTab() {
  const [selected, setSelected] = useState<ScheduleResponseDto | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [numberOfHours, setNumberOfHours] = useState("");
  const [scheduleType, setScheduleType] = useState(String(1));

  const { data, isPending, isError, error } = useGetSchedules({ page, pageSize, search, sortBy: "name", sortOrder: "asc" });
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  useEffect(() => {
    if (isError) {
      toaster.create({ title: "Error al traer horarios", description: error?.message || "Error desconocido", type: "error" });
    }
  }, [isError, error]);

  const labels: label<ScheduleResponseDto>[] = [
    { labelName: "ID", propName: "id", isSortable: true, sortFunction: (a, b) => a.id - b.id },
    { labelName: "Nombre", propName: "name", isSortable: true, sortFunction: (a, b) => (a.name ?? "").localeCompare(b.name ?? "") },
    { labelName: "Hora ingreso", propName: "arrivalTime", transformFunction: (value) => String(value).slice(0, 5) },
    { labelName: "Hora salida", propName: "departureTime", transformFunction: (value) => String(value).slice(0, 5) },
    { labelName: "Horas", propName: "numberOfHours" },
    {
      labelName: "Tipo",
      propName: "scheduleType",
      transformFunction: (value) => {
        const map: Record<number, string> = { 0: "Desconocido", 1: "Mañana", 2: "Tarde", 3: "Noche", 4: "Tiempo completo", 5: "Medio tiempo" };
        return map[Number(value)] ?? String(value);
      },
    },
  ];

  const resetForm = () => {
    setArrivalTime("");
    setDepartureTime("");
    setNumberOfHours("");
    setScheduleType(String(1));
    setIsEditing(false);
    setShowForm(false);
  };

  const onCreate = () => {
    setArrivalTime("");
    setDepartureTime("");
    setNumberOfHours("");
    setScheduleType(String(1));
    setIsEditing(false);
    setShowForm(true);
  };

  const onEdit = () => {
    if (!selected) return;
    setArrivalTime(selected.arrivalTime ?? "");
    setDepartureTime(selected.departureTime ?? "");
    setNumberOfHours(String(selected.numberOfHours ?? 0));
    setScheduleType(String(selected.scheduleType ?? 0));
    setIsEditing(true);
    setShowForm(true);
  };

  const onSave = async () => {
    if (!arrivalTime.trim() || !departureTime.trim()) {
      toaster.create({ title: "Los horarios de ingreso y salida son requeridos", type: "error" });
      return;
    }

    const body = {
      arrivalTime,
      departureTime,
      numberOfHours: Number(numberOfHours),
      scheduleType: Number(scheduleType) as ScheduleTypeEnum,
    };

    try {
      if (isEditing && selected) {
        await updateSchedule.mutateAsync({ id: selected.id, body });
      } else {
        await createSchedule.mutateAsync(body);
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
      await deleteSchedule.mutateAsync(selected.id);
      setSelected(null);
    } catch (mutationError) {
      toaster.create({ title: "No se pudo eliminar", description: mutationError instanceof Error ? mutationError.message : "Error desconocido", type: "error" });
    }
  };

  const saving = createSchedule.isPending || updateSchedule.isPending || deleteSchedule.isPending;

  return (
    <Box display="flex" flexDirection="column" gap={4} p={4}>
      <Box display="flex" flexDirection={{ base: "column", lg: "row" }} gap={3} justifyContent="space-between" alignItems={{ base: "stretch", lg: "center" }}>
        <HStack gap={3} flex={1}>
          <InputGroup startElement={<LuSearch />} maxW={{ base: "100%", lg: "22rem" }}>
            <Input placeholder="Buscar horarios" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </InputGroup>
          <HStack display={{ base: "none", md: "flex" }}>
            <Text fontSize="sm" color="gray.500">Registros por pág.</Text>
            <PageSizeControl params={{ page, pageSize }} paramsChangeFunction={(next) => { setPageSize(next.pageSize ?? 10); setPage(1); }} min={5} max={30} />
          </HStack>
        </HStack>

        <HStack gap={2}>
          <DestructiveActionDialog title="Eliminar horario" description="Una vez eliminado, la acción es irreversible." acceptText="Eliminar" onAccept={onDelete} trigger={<IconButton variant="outline" disabled={!selected || saving}>{deleteSchedule.isPending ? <Spinner size="sm" /> : <Trash2 size={18} />}Eliminar</IconButton>} />
          <IconButton variant="outline" colorPalette="brand" disabled={!selected || saving} onClick={onEdit}><Pencil size={18} />Editar</IconButton>
          <IconButton colorPalette="brand" disabled={saving} onClick={onCreate}><Plus size={18} />Nuevo</IconButton>
        </HStack>
      </Box>

      {showForm && (
        <Stack gap={4}>
          <Heading size="md">{isEditing ? "Editar horario" : "Nuevo horario"}</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <Field.Root>
              <Field.Label>Hora de ingreso <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="time" value={arrivalTime} onChange={(event) => setArrivalTime(event.target.value)} disabled={saving} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Hora de salida <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} disabled={saving} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Cantidad de horas <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="number" min="0" value={numberOfHours} onChange={(event) => setNumberOfHours(event.target.value)} disabled={saving} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Tipo de horario <Text as="span" color="red.500">*</Text></Field.Label>
              <Select.Root
                collection={scheduleTypeCollection}
                value={[scheduleType]}
                onValueChange={(event) => setScheduleType(event.value[0] ?? String(1))}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Seleccionar tipo" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {scheduleTypeCollection.items.map((item) => (
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
        data={data?.schedules ?? []}
        labels={labels}
        loading={isPending}
        onSelect={setSelected}
        noItemsComponent={<EmptyDataScreen title="No hay horarios" message="Crea un nuevo horario para comenzar" icon={<Clock3 />} />}
      />

      <PaginationControl pagination={data?.pagination ?? null} onPageChange={(nextPage) => setPage(nextPage)} />
    </Box>
  );
}
