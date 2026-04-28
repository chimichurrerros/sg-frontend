import type { ProductCategoryDTO } from "@/api/catalog.api";
import { TableBar } from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { useAllCategories, useCreateCategory } from "@/queries/catalog.queries";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuChevronLeft, LuChevronRight, LuSave, LuX } from "react-icons/lu";

export const Categories = () => {
  // Create new category
  const [create, setCreate] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const onCreate = () => {
    setCreate(!create);
    setCreateError(null);
  };

  const { mutate: createCategory, isPending } = useCreateCategory();
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
  const { data, isLoading, error } = useAllCategories();
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

  const handleCreate = (formData: CreateCategoryFormData) => {
    setCreateError(null);

    createCategory(formData, {
      onSuccess: () => {
        reset();
        toaster.create({ title: "Categoria creada con éxito" });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setFocus("name");
      },
      onError: (createCategoryError) => {
        setCreateError(
          "Ha ocurrido un error al crear la categoría: " + createCategoryError,
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
      <TableBar onCreate={onCreate} />

      {create && (
        <Flex
          as="form"
          onSubmit={handleSubmit(handleCreate)}
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
                onClick={onCreate}
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
                <LuSave /> Guardar categoría
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
        onSelect={() => {}}
        loading={isLoading}
      ></TableSelect>

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
            render={(page) => (
              <IconButton
                variant={{ base: "outline", _selected: "solid" }}
                zIndex={{ _selected: "1" }}
                _selected={{ bg: "brand.primary", color: "white" }}
              >
                {page.value}
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
