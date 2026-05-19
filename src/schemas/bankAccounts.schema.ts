import { z } from "zod";

export const createAccountSchema = z.object({
    name: z
        .string({ message: "El nombre es requerido" })
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    accountType: z
        .number({ message: "El tipo de cuenta es requerido" }),
    currentBalance: z
        .number({ message: "El saldo actual es requerido" })
        .min(0, "El saldo no puede ser negativo"),
    availableBalance: z
        .number({ message: "El saldo disponible es requerido" })
        .min(0, "El saldo no puede ser negativo"),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
