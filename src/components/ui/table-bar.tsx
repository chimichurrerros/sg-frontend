import { Button, Flex, Input, InputGroup, Spacer } from "@chakra-ui/react";
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

type TableProps = {
  onCreate?: React.MouseEventHandler<HTMLButtonElement>;
};

export const TableBar = ({ onCreate }: TableProps) => {
  return (
    <Flex gap="0.8rem">
      <InputGroup startElement={<LuSearch />} maxW="32rem">
        <Input placeholder="Buscar" variant="subtle" />
      </InputGroup>
      <Spacer />
      <Button size="sm" variant="outline" colorPalette="brand">
        <LuTrash2 />
        Eliminar
      </Button>
      <Button size="sm" variant="outline" colorPalette="brand">
        <LuPencil />
        Editar
      </Button>
      <Button size="sm" colorPalette="brand" onClick={onCreate}>
        <LuPlus /> Nuevo
      </Button>
    </Flex>
  );
};
