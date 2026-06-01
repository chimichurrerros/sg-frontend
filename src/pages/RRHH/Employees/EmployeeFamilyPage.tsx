import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, createListCollection, Field, Grid, Heading, HStack, Input, Portal, Select, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuPlus, LuTrash2 } from "react-icons/lu";
import { Pencil } from "lucide-react";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { toaster } from "@/components/ui/toaster";
import { useCreateEmployeeRelation, useDeleteEmployeeRelation, useGetEmployee, useGetEmployeeRelations, useUpdateEmployeeRelation } from "@/queries/employees.queries";
import { parseApiError } from "@/utils/api-error";
import { parseDate } from "@/constants/date";
import { parsePrice } from "@/constants/price";

const relationTypeCollection = createListCollection({
  items: [
    { label: "Hijo", value: "1" },
    { label: "Cónyuge", value: "2" },
  ],
});

const familySchema = z.object({
  relationType: z.coerce.number().min(1, "El tipo es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  lastname: z.string().min(1, "El apellido es requerido"),
  documentNumber: z.string().min(1, "La cédula es requerida"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
});

type FamilyFormInput = z.input<typeof familySchema>;
type FamilyFormOutput = z.output<typeof familySchema>;

const getFullName = (employee?: { name?: string | null; lastname?: string | null } | null) =>
  `${employee?.name ?? ""} ${employee?.lastname ?? ""}`.trim();

export default function EmployeeFamilyPage({ basePath = "/rrhh/empleados" }: { basePath?: string }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const employeeId = id ? Number(id) : undefined;

  const { data: employeeData } = useGetEmployee(employeeId);
  const relationsQuery = useGetEmployeeRelations(employeeId);
  const createRelation = useCreateEmployeeRelation(employeeId ?? 0);
  const updateRelation = useUpdateEmployeeRelation(employeeId ?? 0);
  const deleteRelation = useDeleteEmployeeRelation(employeeId ?? 0);
  const [selectedRelationId, setSelectedRelationId] = useState<number | null>(null);
  const [editingRelationId, setEditingRelationId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<FamilyFormInput, any, FamilyFormOutput>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      relationType: 1,
      name: "",
      lastname: "",
      documentNumber: "",
      birthDate: "",
    },
  });

  const employee = employeeData?.employee ?? null;
  const relations = relationsQuery.data?.relations ?? [];
  const isPending = createRelation.isPending || updateRelation.isPending || deleteRelation.isPending;

  const onSubmit = async (formData: FamilyFormOutput) => {
    if (!employeeId) return;

    try {
      const payload = {
        relationType: formData.relationType as 1 | 2,
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        documentNumber: formData.documentNumber.trim(),
        birthDate: formData.birthDate,
      };

      if (editingRelationId) {
        await updateRelation.mutateAsync({ relationId: editingRelationId, data: payload });
        toaster.create({ title: "Familiar actualizado con éxito", type: "success" });
      } else {
        await createRelation.mutateAsync(payload);
        toaster.create({ title: "Familiar agregado con éxito", type: "success" });
      }
      setSelectedRelationId(null);
      setEditingRelationId(null);
      setShowForm(false);
      form.reset({
        relationType: 1,
        name: "",
        lastname: "",
        documentNumber: "",
        birthDate: "",
      });
    } catch (error) {
      const parsed = parseApiError(error as unknown);
      toaster.create({ title: "No se pudo guardar el familiar", description: parsed.message, type: "error" });
    }
  };

  return (
    <Stack gap={6} p={4} maxW="1200px">
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Heading size="xl">Núcleo Familiar — {getFullName(employee)}</Heading>
        <Button variant="outline" onClick={() => navigate(`${basePath}/${employeeId}`)}>
          <LuArrowLeft />
          Volver al perfil
        </Button>
      </HStack>

      <Card.Root variant="outline">
        <Card.Body>
          <Box borderWidth="1px" rounded="md" p={4} bg="bg.subtle">
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
              <Text><Text as="span" fontWeight="semibold">Legajo:</Text> {employee?.fileNumber ?? "-"}</Text>
              <Text><Text as="span" fontWeight="semibold">Cargo actual:</Text> {employee?.positionName ?? "-"}</Text>
              <Text><Text as="span" fontWeight="semibold">Sucursal:</Text> {employee?.branchName ?? "-"}</Text>
              <Text><Text as="span" fontWeight="semibold">Salario base:</Text> {parsePrice(employee?.baseSalary ?? 0)}</Text>
            </Grid>
          </Box>
        </Card.Body>
      </Card.Root>

      {showForm && (
      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">{editingRelationId ? "Editar Familiar" : "Agregar Familiar"}</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={4} as="form" onSubmit={form.handleSubmit(onSubmit)}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.relationType}>
                <Field.Label>Tipo <Text as="span" color="red.500">*</Text></Field.Label>
                <Controller
                  name="relationType"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root
                      collection={relationTypeCollection}
                      value={[String(field.value)]}
                      onValueChange={(event) => field.onChange(Number(event.value[0]))}
                      disabled={isPending}
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
                            {relationTypeCollection.items.map((item) => (
                              <Select.Item item={item} key={item.value}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  )}
                />
                <Field.ErrorText>{form.formState.errors.relationType?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.name}>
                <Field.Label>Nombre <Text as="span" color="red.500">*</Text></Field.Label>
                <Input {...form.register("name")} placeholder="Nombre" disabled={isPending} />
                <Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.lastname}>
                <Field.Label>Apellido <Text as="span" color="red.500">*</Text></Field.Label>
                <Input {...form.register("lastname")} placeholder="Apellido" disabled={isPending} />
                <Field.ErrorText>{form.formState.errors.lastname?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.documentNumber}>
                <Field.Label>Cédula <Text as="span" color="red.500">*</Text></Field.Label>
                <Input {...form.register("documentNumber")} placeholder="Número de documento" disabled={isPending} />
                <Field.ErrorText>{form.formState.errors.documentNumber?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root gridColumn={{ base: "1 / -1", md: "span 4" }} invalid={!!form.formState.errors.birthDate}>
                <Field.Label>Fecha de Nacimiento <Text as="span" color="red.500">*</Text></Field.Label>
                <Input type="date" {...form.register("birthDate")} disabled={isPending} />
                <Field.ErrorText>{form.formState.errors.birthDate?.message}</Field.ErrorText>
              </Field.Root>
            </Grid>

            <HStack justify="space-between">
              <Button variant="outline" onClick={() => {
                setEditingRelationId(null);
                form.reset({
                  relationType: 1,
                  name: "",
                  lastname: "",
                  documentNumber: "",
                  birthDate: "",
                });
                setShowForm(false);
              }} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" colorPalette="brand" loading={isPending} ml="auto">
                <LuPlus />
                {editingRelationId ? "Actualizar" : "Agregar"}
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>
      )}

      <Card.Root variant="outline">
        <Card.Header>
          <HStack justify="space-between">
            <Heading size="md">Familiares Registrados</Heading>
            <HStack gap={2}>
              <Button
                variant="outline"
                colorPalette="brand"
                disabled={!selectedRelationId || isPending}
                onClick={() => {
                  const relation = relations.find((r) => r.id === selectedRelationId);
                  if (!relation) return;
                  setEditingRelationId(relation.id);
                  form.reset({
                    relationType: relation.relationType,
                    name: relation.name ?? "",
                    lastname: relation.lastname ?? "",
                    documentNumber: relation.documentNumber ?? "",
                    birthDate: relation.birthDate ? relation.birthDate.slice(0, 10) : "",
                  });
                  setShowForm(true);
                }}
              >
                <Pencil size={18} />
                Editar
              </Button>
              <DestructiveActionDialog
                title="Eliminar familiar"
                description="Esta acción no se puede deshacer."
                acceptText="Eliminar"
                onAccept={async () => {
                  if (!selectedRelationId) return;
                  await deleteRelation.mutateAsync(selectedRelationId);
                  toaster.create({ title: "Familiar eliminado", type: "success" });
                  setSelectedRelationId(null);
                  setEditingRelationId(null);
                }}
                trigger={
                  <Button variant="outline" colorPalette="brand" disabled={!selectedRelationId || isPending}>
                    {deleteRelation.isPending ? <Spinner size="sm" /> : <LuTrash2 size={18} />}
                    Eliminar
                  </Button>
                }
              />
              <Button
                colorPalette="brand"
                disabled={isPending}
                onClick={() => {
                  setEditingRelationId(null);
                  setSelectedRelationId(null);
                  form.reset({
                    relationType: 1,
                    name: "",
                    lastname: "",
                    documentNumber: "",
                    birthDate: "",
                  });
                  setShowForm(true);
                }}
              >
                <LuPlus size={18} />
                Nuevo familiar
              </Button>
            </HStack>
          </HStack>
        </Card.Header>
        <Card.Body>
          {relationsQuery.isLoading ? (
            <Text>Cargando familiares...</Text>
          ) : relations.length === 0 ? (
            <Text color="fg.muted">Todavía no hay familiares registrados.</Text>
          ) : (
            <Table.ScrollArea borderWidth="1px" rounded="md">
              <Table.Root size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                    <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                    <Table.ColumnHeader>Apellido</Table.ColumnHeader>
                    <Table.ColumnHeader>Cédula</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha de Nacimiento</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {relations.map((relation) => (
                    <Table.Row
                      key={relation.id}
                      onClick={() => setSelectedRelationId(selectedRelationId === relation.id ? null : relation.id)}
                      bg={selectedRelationId === relation.id ? "green.subtle" : "transparent"}
                      _hover={{ bg: selectedRelationId === relation.id ? "green.subtle" : "gray.100" }}
                      cursor="pointer"
                    >
                      <Table.Cell>{relation.relationType === 2 ? "Cónyuge" : relation.relationType === 1 ? "Hijo" : `Tipo #${relation.relationType}`}</Table.Cell>
                      <Table.Cell>{relation.name ?? "-"}</Table.Cell>
                      <Table.Cell>{relation.lastname ?? "-"}</Table.Cell>
                      <Table.Cell>{relation.documentNumber ?? "-"}</Table.Cell>
                      <Table.Cell>{parseDate(relation.birthDate)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
