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
  },
})

export const system = createSystem(defaultConfig, customConfig)