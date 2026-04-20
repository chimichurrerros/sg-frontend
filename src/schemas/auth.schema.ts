import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "El correo electrónico es requerido" })
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string({ message: "La contraseña es requerida" })
    .min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z
    .string({ message: "El apellido es requerido" })
    .min(1, "El apellido es requerido")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z
    .string({ message: "El correo electrónico es requerido" })
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string({ message: "La contraseña es requerida" })
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
  confirmPassword: z
    .string({ message: "La confirmación de contraseña es requerida" })
    .min(1, "La confirmación de contraseña es requerida"),
  rol: z
    .string({ message: "El rol es requerido" })
    .min(1, "El rol es requerido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
