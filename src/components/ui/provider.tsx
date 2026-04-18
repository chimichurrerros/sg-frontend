// components/ui/provider.tsx
"use client";

import { ChakraProvider, Theme } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { system } from "@/styles/theme";

export function ComponentProvider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <Theme appearance="light">
        <ColorModeProvider  {...props} />
      </Theme>
    </ChakraProvider>
  );
}