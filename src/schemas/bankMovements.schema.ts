import { z } from "zod";

export const createMovementSchema = z.object({
    bankAccountId: z
        .number({ message: "La cuenta bancaria es requerida" })
        .min(1, "La cuenta bancaria es requerida"),
    amount: z
        .number({ message: "El monto es requerido" })
        .min(0, "El monto no puede ser negativo"),
    description: z
        .string()
        .optional()
        .or(z.literal("")),
    date: z
        .string({ message: "La fecha es requerida" })
        .min(1, "La fecha es requerida"),
});

export type CreateMovementFormData = z.infer<typeof createMovementSchema>;
