import type { ProductDTO } from "@/api/catalog.api";
import TableBar from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import {
  catalogKeys,
  useAllProducts,
  useDeleteProduct,
} from "@/queries/catalog.queries";
import { ButtonGroup, IconButton, Pagination, Stack } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const Products = () => {
  const navigation = useNavigate();

  const { data, isLoading, error } = useAllProducts();
  const { mutate: deleteProduct } = useDeleteProduct();
  const queryClient = useQueryClient();

  const productsLabels: label<ProductDTO>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Cód.", propName: "barcode" },
    { labelName: "Nombre", propName: "name" },
    { labelName: "Categoría", propName: "productCategoryName" },
    { labelName: "Marca", propName: "productBrandName" },
    { labelName: "Precio", propName: "price" },
    { labelName: "Stock mínimo", propName: "minimumStock" },
  ];
  const [page, setPage] = useState(1);
  const [selected, setSelecteed] = useState<ProductDTO | null>(null);
  const pageSize = 6;
  const allProducts: ProductDTO[] = data ? data.products : [];
  const products = allProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = () => {
    if (!selected) return;
    deleteProduct(selected.id, {
      onSuccess: () => {
        toaster.create({ title: `Se ha eliminado ${selected.name} con éxito` });
        queryClient.invalidateQueries({ queryKey: catalogKeys.products });
      },
      onError: (error) => {
        toaster.create({
          title: `Ha ocurrido un error al eliminar`,
          description: error.message,
        });
      },
    });
  };

  if (error) {
    console.log("Error: " + error);
    return null;
  }

  return (
    <Stack>
      <TableBar
        onDelete={handleDelete}
        onCreate={() => navigation("/dash/catalogo/nuevo-producto")}
        selected={selected}
      />

      <TableSelect
        data={products}
        labels={productsLabels}
        onSelect={(item) => {
          setSelecteed(item);
        }}
        loading={isLoading}
      />

      <Pagination.Root
        count={allProducts.length ?? 0}
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
