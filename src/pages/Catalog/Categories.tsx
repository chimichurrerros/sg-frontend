import type { ProductCategoryDTO } from "@/api/catalog.api";
import TableBar from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { catalogKeys, useAllCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/queries/catalog.queries";
import {
  createCategorySchema,
  type CreateCategoryFormData,
} from "../../schemas/catalog.schema";
import {
  Button,
  ButtonGroup,
  Field,
  Flex,
  IconButton,
  Input,
  Pagination,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LuChevronLeft, LuChevronRight, LuSave, LuX } from "react-icons/lu";

type FormMode = "create" | "edit" | null;

export const Categories = () => {
  const [mode, setMode] = useState<FormMode>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductCategoryDTO | null>(null);
  const queryClient = useQueryClient();

  const isFormOpen = mode !== null;
  const isEditMode = mode === "edit";

  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: createCategory, isPending: isCreatePending } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatePending } = useUpdateCategory();
  const isPending = isCreatePending || isUpdatePending;

  const {
    register,
    reset,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Categories table
  const { data, isLoading, error, isError } = useAllCategories();
  const categoriesLabels: label<ProductCategoryDTO>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Nombre", propName: "name" },
  ];
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const allCategories: ProductCategoryDTO[] = data
    ? data.productCategories.sort()
    : [];
  const categories = allCategories.slice((page - 1) * pageSize, page * pageSize);

  const toggleForm = () => {
    if (mode) {
      setMode(null);
      reset({ name: "" });
    } else {
      setMode("create");
    }
    setCreateError(null);
  };

  const handleEdit = () => {
    if (!selected) return;
    reset({ name: selected.name });
    setMode("edit");
    setCreateError(null);
    setFocus("name");
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteCategory(selected.id, {
      onSuccess: () => {
        toaster.create({ title: `Se ha eliminado ${selected.name} con éxito` });
        setSelected(null);
        queryClient.invalidateQueries({ queryKey: catalogKeys.categories });
      },
      onError: (error) => {
        toaster.create({
          title: `Ha ocurrido un error al eliminar`,
          description: error.message,
        });
      },
    });
  };

  const handleSave = (formData: CreateCategoryFormData) => {
    setCreateError(null);

    if (isEditMode && selected) {
      updateCategory(
        { id: selected.id, data: formData },
        {
          onSuccess: () => {
            reset();
            toaster.create({ title: "Categoría actualizada con éxito" });
            queryClient.invalidateQueries({ queryKey: catalogKeys.categories });
            setMode(null);
          },
          onError: (err) => {
            setCreateError(
              "Ha ocurrido un error al actualizar la categoría: " + err,
            );
          },
        },
      );
      return;
    }

    createCategory(formData, {
      onSuccess: () => {
        reset();
        toaster.create({ title: "Categoría creada con éxito" });
        queryClient.invalidateQueries({ queryKey: catalogKeys.categories });
        setFocus("name");
      },
      onError: (err) => {
        setCreateError(
          "Ha ocurrido un error al crear la categoría: " + err,
        );
      },
    });
  };

  useEffect(() => {
    if (isError) {
      toaster.create({ title: "Error al cargar las categorías", description: error?.message || "Error desconocido", type: "error" });
    }
  }, [error, isError]);

  return (
    <Stack>
      <TableBar
        onCreate={toggleForm}
        onEdit={selected && !isFormOpen ? handleEdit : undefined}
        onDelete={handleDelete}
        selected={selected}
      />

      {isFormOpen && (
        <Flex
          as="form"
          onSubmit={handleSubmit(handleSave)}
          columns={2}
          gap="1rem 2.5rem"
          data-state="open"
          _open={{
            animation: "fade-in 300ms ease-out",
          }}
        >
          <Field.Root invalid={!!errors.name} required>
            <Input
              {...register("name")}
              placeholder="Nombre"
              disabled={isPending}
            />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>
          <VStack justifySelf="end" alignItems="end" gap={2}>
            <ButtonGroup>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleForm}
                disabled={isPending}
              >
                <LuX /> Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                bgColor="brand.primary"
                loading={isPending}
              >
                <LuSave /> {isEditMode ? "Actualizar categoría" : "Guardar categoría"}
              </Button>
            </ButtonGroup>

            {createError && (
              <Text color="red.500" fontSize="xs" textAlign="center">
                {createError}
              </Text>
            )}
          </VStack>
        </Flex>
      )}

      <TableSelect
        labels={categoriesLabels}
        data={categories}
        onSelect={(item) => setSelected(item)}
        loading={isLoading}
      />

      <Pagination.Root
        count={allCategories.length ?? 0}
        pageSize={pageSize}
        page={page}
        onPageChange={(e) => setPage(e.page)}
        display="flex"
        justifyContent="center"
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
    </Stack>
  );
};
