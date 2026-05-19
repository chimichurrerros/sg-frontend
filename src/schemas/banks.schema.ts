import { z } from "zod";

export const createBankSchema = z.object({
    name: z
        .string({ message: "El nombre es requerido" })
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    accountNumber: z
        .string({ message: "El número de cuenta es requerido" })
        .min(1, "El número de cuenta es requerido"),
    accountType: z
        .number({ message: "El tipo de cuenta bancaria es requerido" }),
    ruc: z
        .string({ message: "El RUC es requerido" })
        .min(1, "El RUC es requerido"),
});

export type CreateBankFormData = z.infer<typeof createBankSchema>;
