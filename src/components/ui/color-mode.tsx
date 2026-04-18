// components/ui/color-mode.tsx
"use client";

import type { IconButtonProps } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

type ColorMode = "light" | "dark";

export interface ColorModeProviderProps {
  children: React.ReactNode;
  forcedColorMode?: ColorMode;
}

interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = React.createContext<ColorModeContextType | undefined>(undefined);

export function ColorModeProvider({ children, forcedColorMode }: { children: React.ReactNode; forcedColorMode?: ColorMode }) {
  const [colorMode, setColorMode] = React.useState<ColorMode>(forcedColorMode || "light");

  const toggleColorMode = () => {
    setColorMode(prev => prev === "light" ? "dark" : "light");
  };

  // Si hay forcedColorMode, ignorar el toggle
  const value = {
    colorMode: forcedColorMode || colorMode,
    toggleColorMode: forcedColorMode ? () => {} : toggleColorMode,
  };

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = React.useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? <LuMoon /> : <LuSun />;
}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode();
    return (
      <ClientOnly fallback={<Skeleton boxSize="9" />}>
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label="Toggle color mode"
          size="sm"
          ref={ref}
          {...props}
        >
          <ColorModeIcon />
        </IconButton>
      </ClientOnly>
    );
  }
);