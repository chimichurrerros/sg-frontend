import { useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { Heading, Button, Stack } from "@chakra-ui/react";

function App() {
  return (
    <Stack gap="2" align="flex-start">
      <Heading size="2xl">Bigotires ERP</Heading>
      <Tooltip content="This is the tooltip message!" showArrow>
        <Button colorPalette="teal" size="md">
          Hover Me
        </Button>
      </Tooltip>
    </Stack>
  );
}

export default App;
