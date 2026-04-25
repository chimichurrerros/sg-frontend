import type { ProductDTO } from "@/api/catalog.api";
import { TableBar } from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { useAllProducts } from "@/queries/catalog.queries";
import {
  ButtonGroup,
  IconButton,
  Pagination,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const Products = () => {
  const navigation = useNavigate();

  const { data, isLoading, error } = useAllProducts();
  const productsLabels: label<ProductDTO>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Nombre", propName: "name" },
    { labelName: "Categoría", propName: "productCategoryName" },
    { labelName: "Marca", propName: "productBrandName" },
    { labelName: "Precio", propName: "price" },
    { labelName: "Stock mínimo", propName: "minimumStock" },
  ];
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const allProducts: ProductDTO[] = data ? data.products : [];
  const products = allProducts.slice((page - 1) * pageSize, page * pageSize);

  if (error) {
    console.log("Error: " + error);
    return;
  }

  return (
    <Stack>
      <TableBar onCreate={() => navigation("/dash/catalogo/nuevo-producto")} />

      <TableSelect
        data={products}
        labels={productsLabels}
        onSelect={() => {}}
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
