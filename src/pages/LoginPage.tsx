import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Input,
  Text,
  VStack,
  Field,
} from "@chakra-ui/react";
import { useLogin } from "@/queries/auth.queries";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { PasswordInput } from "@/components/ui/password-input";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    setAuthError(null);

    login(data, {
      onSuccess: () => {
        navigate("/dash", { replace: true });
      },
      onError: () => {
        setAuthError(
          "Credenciales inválidas. Verifique su correo y contraseña.",
        );
      },
    });
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="sm">
        <VStack gap={4} align="stretch">
          <Text fontSize="3xl" fontWeight="bold" textAlign="center">
            Iniciar Sesión
          </Text>

          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4}>
              <Field.Root invalid={!!errors.email}>
                <Field.Label>Correo electrónico</Field.Label>
                <Input
                  {...register("email")}
                  placeholder="correo@bigotires.com.py"
                />
                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label>Contraseña</Field.Label>
                <PasswordInput {...register("password")} />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>

              <VStack w="full" gap={2}>
                <Button
                  type="submit"
                  size="xl"
                  w="full"
                  bgColor="brand.primary"
                  loading={isPending}
                >
                  Acceder
                </Button>

                {authError && (
                  <Text color="red.500" fontSize="xs" textAlign="center">
                    {authError}
                  </Text>
                )}
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
