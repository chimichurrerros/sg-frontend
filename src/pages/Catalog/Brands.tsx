import type { ProductBrandDTO } from "@/api/catalog.api";
import TableBar from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { catalogKeys, useAllBrands, useCreateBrand, useDeleteBrand, useUpdateBrand } from "@/queries/catalog.queries";
import {
  createBrandSchema,
  type CreateBrandFormData,
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuChevronLeft, LuChevronRight, LuSave, LuX } from "react-icons/lu";

type FormMode = "create" | "edit" | null;

export const Brands = () => {
  const [mode, setMode] = useState<FormMode>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductBrandDTO | null>(null);
  const queryClient = useQueryClient();

  const isFormOpen = mode !== null;
  const isEditMode = mode === "edit";

  const { mutate: deleteBrand } = useDeleteBrand();
  const { mutate: createBrand, isPending: isCreatePending } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdatePending } = useUpdateBrand();
  const isPending = isCreatePending || isUpdatePending;

  const {
    register,
    reset,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBrandFormData>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: "",
    },
  });

  // Brands table
  const { data, isLoading, error } = useAllBrands();
  const brandsLabels: label<ProductBrandDTO>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Nombre", propName: "name" },
  ];
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const allBrands: ProductBrandDTO[] = data ? data.productBrands.sort() : [];
  const brands = allBrands.slice((page - 1) * pageSize, page * pageSize);

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
    deleteBrand(selected.id, {
      onSuccess: () => {
        toaster.create({ title: `Se ha eliminado ${selected.name} con éxito` });
        setSelected(null);
        queryClient.invalidateQueries({ queryKey: catalogKeys.brands });
      },
      onError: (error) => {
        toaster.create({
          title: `Ha ocurrido un error al eliminar`,
          description: error.message,
        });
      },
    });
  };

  const handleSave = (formData: CreateBrandFormData) => {
    setCreateError(null);

    if (isEditMode && selected) {
      updateBrand(
        { id: selected.id, data: formData },
        {
          onSuccess: () => {
            reset();
            toaster.create({ title: "Marca actualizada con éxito" });
            queryClient.invalidateQueries({ queryKey: catalogKeys.brands });
            setMode(null);
          },
          onError: (err) => {
            setCreateError(
              "Ha ocurrido un error al actualizar la marca: " + err,
            );
          },
        },
      );
      return;
    }

    createBrand(formData, {
      onSuccess: () => {
        reset();
        toaster.create({ title: "Marca creada con éxito" });
        queryClient.invalidateQueries({ queryKey: ["brands"] });
        setFocus("name");
      },
      onError: (err) => {
        setCreateError(
          "Ha ocurrido un error al crear la marca: " + err,
        );
      },
    });
  };

  if (error) {
    console.log("Error: " + error);
    return;
  }

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
                <LuSave /> {isEditMode ? "Actualizar marca" : "Guardar marca"}
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
        data={brands}
        labels={brandsLabels}
        onSelect={(item) => setSelected(item)}
        loading={isLoading}
      />

      <Pagination.Root
        count={allBrands.length ?? 0}
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
