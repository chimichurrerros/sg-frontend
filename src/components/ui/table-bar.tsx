import { Button, Flex, Input, InputGroup, Spacer } from "@chakra-ui/react";
import type { MouseEventHandler } from "react";
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

type TableProps<T> = {
  selected?: T | null;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
  onEdit?: MouseEventHandler<HTMLButtonElement>;
  onCreate?: MouseEventHandler<HTMLButtonElement>;
};

export default function TableBar<T>({
  selected = null,
  onDelete,
  onEdit,
  onCreate,
}: TableProps<T>) {
  return (
    <Flex gap="0.8rem">
      <InputGroup startElement={<LuSearch />} maxW="32rem">
        <Input placeholder="Buscar" variant="subtle" />
      </InputGroup>
      <Spacer />
      <Button
        size="sm"
        variant="outline"
        colorPalette="brand"
        disabled={selected === null}
        onClick={onDelete}
      >
        <LuTrash2 />
        Eliminar
      </Button>
      <Button
        size="sm"
        variant="outline"
        colorPalette="brand"
        disabled={selected === null}
        onClick={onEdit}
      >
        <LuPencil />
        Editar
      </Button>
      <Button size="sm" colorPalette="brand" onClick={onCreate}>
        <LuPlus /> Nuevo
      </Button>
    </Flex>
  );
}
