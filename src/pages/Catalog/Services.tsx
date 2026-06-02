import type { ServiceResponseDto } from "@/api/service.api";
import TableBar from "@/components/ui/table-bar";
import TableSelect, { type label } from "@/components/ui/table-select";
import { toaster } from "@/components/ui/toaster";
import { parsePrice } from "@/constants/price";
import {
  catalogKeys,
  useAllServices,
  useDeleteService,
} from "@/queries/catalog.queries";
import { ButtonGroup, IconButton, Pagination, Stack } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const Services = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useAllServices();
  const { mutate: deleteService } = useDeleteService();
  const queryClient = useQueryClient();

  const servicesLabels: label<ServiceResponseDto>[] = [
    { labelName: "ID", propName: "id" },
    { labelName: "Cód.", propName: "barcode" },
    { labelName: "Nombre", propName: "name" },
    { labelName: "Descripción", propName: "description" },
    {
      labelName: "Precio",
      propName: "price",
      transformFunction: (value) => parsePrice(value),
    },
    { labelName: "Costo", propName: "cost" },
  ];
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ServiceResponseDto | null>(null);
  const pageSize = 6;
  const allServices: ServiceResponseDto[] = data ? data.services : [];
  const services = allServices.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = () => {
    if (!selected) return;
    deleteService(selected.id, {
      onSuccess: () => {
        toaster.create({ title: `Se ha eliminado ${selected.name} con éxito` });
        queryClient.invalidateQueries({ queryKey: catalogKeys.services });
      },
      onError: (error) => {
        toaster.create({
          title: `Ha ocurrido un error al eliminar`,
          description: error.message,
        });
      },
    });
  };

  const handleEdit = () => {
    if (!selected) return;
    navigate(`/dash/catalogo/servicios/${selected.id}`);
  };

  if (error) {
    console.log("Error: " + error);
    return null;
  }

  return (
    <Stack>
      <TableBar
        onDelete={handleDelete}
        onEdit={selected ? handleEdit : undefined}
        onCreate={() => navigate("/dash/catalogo/nuevo-servicio")}
        selected={selected}
      />
      <TableSelect
        data={services}
        labels={servicesLabels}
        onSelect={(item) => setSelected(item)}
        onDoubleClick={(item) =>
          navigate(`/dash/catalogo/servicios/${item.id}`)
        }
        loading={isLoading}
      />

      <Pagination.Root
        count={allServices.length ?? 0}
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
