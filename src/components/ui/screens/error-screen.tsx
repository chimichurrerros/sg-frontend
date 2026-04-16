import { Box } from "@chakra-ui/react/box";
import { Heading } from "@chakra-ui/react/heading";
import { Text, Button, Icon, HStack, Flex } from "@chakra-ui/react";
import { TriangleAlert } from "lucide-react";

interface errorProps {
  errorMessage: string;
  title: string;
  retry?: () => void;
  retryText?: string;
}

/**
 * Error screen
 * if you don't want a retry button, just don't pass a retry function
 */
export const ErrorScreen: React.FC<errorProps> = ({
  errorMessage,
  title,
  retry,
  retryText = "Reintentar",
}) => {
  return (
    <Flex
      w="100%"
      h="100%"
      alignItems="center"
      justifyContent="center"
      bgColor="gray.50"
      rounded="lg"
    >
      <Box
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          borderRadius="md"
          p={{ base: 4, sm: 6 }}
          textAlign="center"
          bgColor="white"
          maxW="90%"
          w="auto"
          minW="300px"
          border="1px solid"
          borderColor="gray.100"
        >
          <HStack 
            align="center" 
            justify="center" 
            textTransform="uppercase" 
            mb={3} 
            bgColor="red.50" 
            p={3} 
            borderRadius="md"
            flexWrap="wrap"
            gap={2}
          >
            <Icon boxSize={5} color="red.500">
              <TriangleAlert />
            </Icon>
            <Heading
              fontWeight="semibold"
              size={{ base: "sm", sm: "md" }}
              color="gray.700"
              m={0}
              letterSpacing="-0.025em"
            >
              {title || "Error"}
            </Heading>
          </HStack>

          <Text 
            fontSize={{ base: "xs", sm: "sm" }} 
            color="gray.600" 
            mb={4}
            wordBreak="break-word"
          >
            {errorMessage || "Ha ocurrido un error inesperado"}
          </Text>

          {retry && (
            <Button
              size="xs"
              variant="outline"
              onClick={retry}
              colorPalette="red"
              fontWeight="medium"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {retryText}
            </Button>
          )}
        </Box>
      </Box>
    </Flex>
  );
};