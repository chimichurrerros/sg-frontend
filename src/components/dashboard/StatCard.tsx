import { Box, HStack, Spinner, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isLoading?: boolean;
  color?: string;
}

export const StatCard = ({ icon: IconEl, label, value, isLoading, color }: StatCardProps) => (
  <Box
    bg="white"
    borderWidth="1px"
    borderColor="gray.200"
    borderRadius="lg"
    p={4}
    boxShadow="sm"
  >
    <HStack gap={4}>
      <Box color={color ?? "brand.primary"}>
        <IconEl size={32} />
      </Box>
      <Box>
        <Text color="gray.500" fontSize="sm" fontWeight="medium">
          {label}
        </Text>
        {isLoading ? (
          <Spinner size="sm" mt={1} />
        ) : (
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
        )}
      </Box>
    </HStack>
  </Box>
);
