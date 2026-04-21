import { TableBar } from "@/components/ui/TableBar";
import { useAllBrands } from "@/queries/catalog.queries";
import {
  ButtonGroup,
  IconButton,
  Input,
  Pagination,
  Skeleton,
  Stack,
  Table,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export const Brands = () => {
  const [create, setCreate] = useState<boolean>(false);
  const onCreate = () => {
    setCreate(!create);
  };

  const { data, isLoading, error } = useAllBrands();

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredBrands = data ? data.productBrands.sort() : [];

  if (error) {
    console.log("Error: " + error);
    return;
  }

  return (
    <Stack>
      <TableBar onCreate={onCreate} />
      <Input
        placeholder="Nombre"
        hidden={!create}
        data-state={create ? "open" : "closed"}
        _open={{
          animation: "fade-in 300ms ease-out",
        }}
      />

      <Skeleton height="150px" loading={isLoading}>
        <Stack>
          <Table.Root variant="outline" boxShadow="none">
            <Table.ColumnGroup>
              <Table.Column htmlWidth="20%" />
              <Table.Column htmlWidth="30%" />
            </Table.ColumnGroup>

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredBrands
                .slice((page - 1) * pageSize, page * pageSize)
                .map((brand) => (
                  <Table.Row key={brand.id} cursor="pointer">
                    <Table.Cell>{brand.id}</Table.Cell>
                    <Table.Cell>{brand.name}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table.Root>

          <Pagination.Root
            count={filteredBrands.length ?? 0}
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
      </Skeleton>
    </Stack>
  );
};
