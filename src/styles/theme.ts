import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          primary: { value: "#004225" },
          secondary: { value: "#49A078" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid:      { value: { _light: "{colors.brand.primary}",   _dark: "{colors.brand.secondary}" } },
          contrast:   { value: { _light: "#ffffff",                  _dark: "#ffffff" } },
          fg:         { value: { _light: "{colors.brand.primary}",   _dark: "{colors.brand.secondary}" } },
          muted:      { value: { _light: "{colors.brand.secondary}", _dark: "#2d7a56" } },
          subtle:     { value: { _light: "#e8f5ee",                  _dark: "#0a2e1a" } },
          emphasized: { value: { _light: "#005c33",                  _dark: "#62c996" } },
          focusRing:  { value: { _light: "{colors.brand.primary}",   _dark: "{colors.brand.secondary}" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)