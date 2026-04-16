import { useState } from "react";
import { Outlet }   from "react-router-dom";
import { Box }      from "@chakra-ui/react";
import { Sidebar }  from "./Sidebar";
import { TopBar }   from "./TopBar";

export const HomeLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box display="flex" h="100vh" overflow="hidden">
      <Sidebar collapsed={collapsed} />
      <Box display="flex" flexDirection="column" flex={1} overflow="hidden" minW={0}>
        <TopBar onToggle={() => setCollapsed(c => !c)} />
        <Box as="main" flex={1} overflow="auto" bg="bg.canvas" p="24px">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};