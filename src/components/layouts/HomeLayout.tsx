import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const HomeLayout = () => {
  const { getLocalStorage, saveLocalStorage } = useLocalStorage();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const preferences = getLocalStorage("appConfig");
    return preferences?.saveSidebarState ? preferences?.lastSidebarState : false;
  });

  // Sincronizar con localStorage
  useEffect(() => {
    const preferences = getLocalStorage("appConfig");

    saveLocalStorage("appConfig", {
      ...preferences,
      lastSidebarState: collapsed,
    });
  }, [collapsed]);


  return (
    <Box display="flex" h="100vh" overflow="hidden">
      <Sidebar collapsed={collapsed} />
      <Box display="flex" flexDirection="column" flex={1} overflow="hidden" minW={0}>
        <TopBar onToggle={() => setCollapsed(c => !c)} />
        <Box as="main" flex={1} overflow="auto" bg="bg.canvas" p="10px">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};